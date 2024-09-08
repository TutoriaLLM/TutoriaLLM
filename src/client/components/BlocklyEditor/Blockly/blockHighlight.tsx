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
		console.log(`BlockHighlight init${targetBlockId}`);
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
		this.dimNonTargetBlocks(); // フォーカスしていないブロックを暗くする
	}

	dispose() {
		console.log("BlockHighlight dispose");
		this.restoreBlockOpacity(); // すべてのブロックの透明度を元に戻す
		if (this.svgGroup) {
			console.log("BlockHighlight dispose svgGroup");
			this.svgGroup.setAttribute("opacity", "0");
			Blockly.utils.dom.removeNode(this.svgGroup);
			this.svgGroup = undefined; // 確実にメモリリークを防ぐためにnullに設定
		}
		if (this.onChangeWrapper) {
			this.workspace.removeChangeListener(this.onChangeWrapper);
			this.onChangeWrapper = undefined; // 確実にメモリリークを防ぐためにnullに設定
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
			this.dimNonTargetBlocks(); // フォーカスしていないブロックを暗くする
		}
	}

	private handleBlockDrag(event: Blockly.Events.BlockDrag) {
		if (event.isStart) {
			this.isDragging = true;
			this.restoreBlockOpacity(); // ドラッグ中はすべてのブロックの透明度を1にする
		} else {
			this.isDragging = false;
			this.dispose(); // ドラッグ終了後にハイライトを消す
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
					this.updatePathStroke(blockSvg, "none"); // 非対象ブロックはボーダーなし
				} else {
					blockSvg.setAttribute("opacity", "1");
					this.updatePathStroke(blockSvg, "red", "3px"); // 対象ブロックは赤いボーダー
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
				this.updatePathStroke(blockSvg, "none"); // ボーダーを消す
			}
		}
	}

	// <path>のstrokeとstrokeWidthを更新するためのヘルパーメソッド
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
