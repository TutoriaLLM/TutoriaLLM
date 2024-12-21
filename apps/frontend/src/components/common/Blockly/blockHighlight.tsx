/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * This file has been modified by So Tokumaru.
 * Modifications include:
 * - Highlights block by id instead of content area.
 * - Adjusted applyColor method to use custom theme.
 * - Added animations for highlighting and dimming blocks.
 */
import * as Blockly from "blockly/core";

const contentChangeEvents = [
	Blockly.Events.VIEWPORT_CHANGE,
	Blockly.Events.BLOCK_MOVE,
	Blockly.Events.BLOCK_DELETE,
	Blockly.Events.COMMENT_MOVE,
	Blockly.Events.COMMENT_CREATE,
	Blockly.Events.COMMENT_DELETE,
];

const defaultPadding = 10;
const animationTime = 0.25;

export class BlockHighlight {
	private width = 0;
	private height = 0;
	private top = 0;
	private left = 0;
	private lastScale = 1;
	private padding = defaultPadding;
	private svgGroup?: SVGGElement;
	private rect?: SVGRectElement;
	private background?: SVGRectElement;
	private onChangeWrapper?: (event: Blockly.Events.Abstract) => void;
	private targetBlockId?: string;
	private isDragging = false;

	constructor(protected workspace: Blockly.WorkspaceSvg) {}

	init(padding?: number, targetBlockId?: string) {
		this.padding = padding || defaultPadding;
		this.targetBlockId = targetBlockId;

		this.svgGroup = Blockly.utils.dom.createSvgElement(
			Blockly.utils.Svg.G,
			{ class: "contentAreaHighlight" },
			null,
		);

		const rnd = String(Math.random()).substring(2);
		const mask = Blockly.utils.dom.createSvgElement(
			new Blockly.utils.Svg("mask"),
			{
				id: `contentAreaHighlightMask${rnd}`,
			},
			this.svgGroup,
		);
		Blockly.utils.dom.createSvgElement(
			Blockly.utils.Svg.RECT,
			{
				x: 0,
				y: 0,
				width: "100%",
				height: "100%",
				fill: "white",
			},
			mask,
		);
		this.rect = Blockly.utils.dom.createSvgElement(
			Blockly.utils.Svg.RECT,
			{
				x: 0,
				y: 0,
				rx: Blockly.bubbles.Bubble.BORDER_WIDTH,
				ry: Blockly.bubbles.Bubble.BORDER_WIDTH,
				fill: "black",
			},
			mask,
		);
		this.background = Blockly.utils.dom.createSvgElement(
			Blockly.utils.Svg.RECT,
			{
				x: 0,
				y: 0,
				width: "100%",
				height: "100%",
				mask: `url(#contentAreaHighlightMask${rnd})`,
			},
			this.svgGroup,
		);

		this.applyColor();
		const metricsManager = this.workspace.getMetricsManager();
		this.resize();
		const absoluteMetrics = metricsManager.getAbsoluteMetrics();
		this.position(absoluteMetrics);

		this.svgGroup.style.transition = `opacity ${animationTime}s`;

		const parentSvg = this.workspace.getParentSvg();
		if (parentSvg.firstChild) {
			parentSvg.insertBefore(this.svgGroup, parentSvg.firstChild);
		} else {
			parentSvg.appendChild(this.svgGroup);
		}

		this.onChangeWrapper = this.onChange.bind(this);
		this.workspace.addChangeListener(this.onChangeWrapper);
		this.dimNonTargetBlocks(); // Darken unfocused blocks.
	}

	dispose() {
		this.restoreBlockOpacity(); // Restore transparency of all blocks
		if (this.svgGroup) {
			this.svgGroup.setAttribute("opacity", "0");
			Blockly.utils.dom.removeNode(this.svgGroup);
			this.svgGroup = undefined; // Set to null to ensure no memory leaks
		}
		if (this.onChangeWrapper) {
			this.workspace.removeChangeListener(this.onChangeWrapper);
			this.onChangeWrapper = undefined; // Set to null to ensure no memory leaks
		}
	}

	private onChange(event: Blockly.Events.Abstract) {
		if (event.type === Blockly.Events.THEME_CHANGE) {
			this.applyColor();
		} else if (contentChangeEvents.indexOf(event.type) !== -1) {
			const metricsManager = this.workspace.getMetricsManager();
			if (event.type !== Blockly.Events.VIEWPORT_CHANGE) {
				this.resize();
			}
			const absoluteMetrics = metricsManager.getAbsoluteMetrics();
			this.position(absoluteMetrics);
		} else if (event.type === Blockly.Events.BLOCK_DRAG) {
			this.handleBlockDrag(event as Blockly.Events.BlockDrag);
		} else if (event.type === Blockly.Events.BLOCK_CHANGE) {
			this.resize();
		}
		if (!this.isDragging) {
			this.dimNonTargetBlocks(); // Darken unfocused blocks.
		}
	}

	private handleBlockDrag(event: Blockly.Events.BlockDrag) {
		if (event.isStart) {
			this.isDragging = true;
			this.restoreBlockOpacity(); // Transparency of all blocks is set to 1 while dragging
		} else {
			this.isDragging = false;
			this.dispose(); // Remove highlight after drag ends.
		}

		if (this.svgGroup) {
			this.svgGroup.setAttribute("opacity", event.isStart ? "0" : "1");
		}
	}

	private applyColor() {
		const theme = this.workspace.getTheme();
		const bgColor =
			theme.getComponentStyle("workspaceBackgroundColour") || "#ffffff";

		const colorDarkened = Blockly.utils.colour.blend("#000", bgColor, 0.15);
		const colorLightened = Blockly.utils.colour.blend("#fff", bgColor, 0.1);
		const color =
			bgColor === "#f3f4f6" || bgColor === "#fff"
				? colorDarkened
				: colorLightened;
		if (!color) return;
		this.background?.setAttribute("fill", color);
	}

	private resize() {
		const targetBlock = this.workspace.getBlockById(this.targetBlockId || "");
		if (targetBlock) {
			const blockBounds = targetBlock.getBoundingRectangle();
			const width = blockBounds.right - blockBounds.left + 2 * this.padding;
			const height = blockBounds.bottom - blockBounds.top + 2 * this.padding;
			if (width !== this.width) {
				this.width = width;
				this.rect?.setAttribute("width", `${width}`);
			}
			if (height !== this.height) {
				this.height = height;
				this.rect?.setAttribute("height", `${height}`);
			}
		}
	}

	private position(absoluteMetrics: Blockly.MetricsManager.AbsoluteMetrics) {
		const targetBlock = this.workspace.getBlockById(this.targetBlockId || "");
		if (targetBlock) {
			const blockBounds = targetBlock.getBoundingRectangle();
			const viewTop = -this.workspace.scrollY;
			const viewLeft = -this.workspace.scrollX;
			const scale = this.workspace.scale;
			const top =
				absoluteMetrics.top +
				blockBounds.top * scale -
				viewTop -
				this.padding * scale;
			const left =
				absoluteMetrics.left +
				blockBounds.left * scale -
				viewLeft -
				this.padding * scale;

			if (top !== this.top || left !== this.left || this.lastScale !== scale) {
				this.top = top;
				this.left = left;
				this.lastScale = scale;
				this.rect?.setAttribute(
					"transform",
					`translate(${left}, ${top}) scale(${scale})`,
				);
			}
		}
	}

	private dimNonTargetBlocks() {
		const blocks = this.workspace.getAllBlocks(false);
		for (const block of blocks) {
			const blockSvg = block.getSvgRoot();
			if (blockSvg) {
				blockSvg.style.transition = `opacity ${animationTime}s`;
				if (block.id !== this.targetBlockId) {
					blockSvg.setAttribute("opacity", "0.5");
					this.updatePathStroke(blockSvg, "none"); // No border for non-targeted blocks
				} else {
					blockSvg.setAttribute("opacity", "1");
					this.updatePathStroke(blockSvg, "red", "3px"); // Target block has a red border
				}
			}
		}
	}

	private restoreBlockOpacity() {
		const blocks = this.workspace.getAllBlocks(false);
		for (const block of blocks) {
			const blockSvg = block.getSvgRoot();
			if (blockSvg) {
				blockSvg.style.transition = `opacity ${animationTime}s`;
				blockSvg.setAttribute("opacity", "1");
				this.updatePathStroke(blockSvg, "none"); // Erase borders
			}
		}
	}

	// Helper method to update stroke and strokeWidth of <path>.
	private updatePathStroke(
		blockSvg: SVGElement,
		strokeColor: string,
		strokeWidth = "3px",
	) {
		const paths = blockSvg.getElementsByTagName("path");
		for (const path of paths) {
			path.style.stroke = strokeColor;
			path.style.strokeWidth = strokeWidth;
		}
	}
}
