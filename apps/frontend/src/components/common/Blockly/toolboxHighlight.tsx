/**
 * This is a wrapper of BlockHighlight that is used to highlight the block in the toolbox.
 * - This function is designed to highlight the block within the toolbox(flyout).
 * - It highlights parent category that contains the target block.
 */

import { BlockHighlight } from "./blockHighlight";
import * as Blockly from "blockly/core";
import type { WorkspaceSvg } from "blockly";

export class ToolboxHighlighter {
	private workspace: WorkspaceSvg;
	private blockName: string | null = null;
	private onUserMovedTargetBlock: () => void;
	private highlightInstance: BlockHighlight | null = null;

	constructor(workspace: WorkspaceSvg, onUserMovedTargetBlock: () => void) {
		this.workspace = workspace;
		this.onUserMovedTargetBlock = onUserMovedTargetBlock;
	}

	private highlightCategory() {
		function highlightCategory(category: Blockly.ToolboxCategory) {
			const div = category.getDiv();
			const labelDOM = div?.getElementsByClassName(
				"blocklyTreeRow",
			)[0] as HTMLElement;
			if (labelDOM) {
				labelDOM.style.backgroundColor = "#ef4444";
				labelDOM.classList.add("highlight");
			}
		}

		function highlightParentCategory(category: Blockly.ToolboxCategory) {
			let parent = category.getParent();
			while (parent) {
				const parentCategory = parent as Blockly.CollapsibleToolboxCategory;
				parent = parentCategory.getParent();
				highlightCategory(parentCategory);
				highlightParentCategory(parentCategory);
			}
		}

		function containsBlockType(
			contents: Blockly.utils.toolbox.FlyoutItemInfoArray,
			blockType: string,
		): boolean {
			return contents.some(
				(content) =>
					content.kind === "block" &&
					"type" in content &&
					content.type === blockType,
			);
		}

		const toolboxItem = (
			this.workspace.getToolbox() as Blockly.Toolbox
		).getToolboxItems();

		for (const item of toolboxItem) {
			if (item.isSelectable()) {
				const category = item as Blockly.ToolboxCategory;
				const contents = category.getContents();
				if (
					typeof contents !== "string" &&
					this.blockName &&
					containsBlockType(contents, this.blockName)
				) {
					highlightCategory(category);
				}
			}

			if (item.isCollapsible()) {
				const category = item as Blockly.CollapsibleToolboxCategory;
				const children = category.getChildToolboxItems();
				for (const child of children) {
					const childItem = child as Blockly.ToolboxCategory;
					const contents = childItem.getContents();
					if (
						typeof contents !== "string" &&
						this.blockName &&
						containsBlockType(contents, this.blockName)
					) {
						highlightCategory(childItem);
						highlightParentCategory(childItem);
					}
				}
			}
		}
	}

	private onToolboxOpen = (event: Blockly.Events.Abstract) => {
		if (event.type === Blockly.Events.TOOLBOX_ITEM_SELECT) {
			this.highlightInstance?.dispose();
			const toolbox = this.workspace.getToolbox();
			const flyout = toolbox?.getFlyout();
			if (flyout) {
				const flyoutWorkspace = flyout.getWorkspace();
				if (flyoutWorkspace && this.blockName) {
					const block = flyoutWorkspace.getBlocksByType(this.blockName);
					this.highlightInstance = new BlockHighlight(flyoutWorkspace);

					if (block && block.length > 0) {
						this.highlightInstance.init(10, block[0].id);
					}
					if (block && block.length === 0) {
						this.highlightInstance.init(10, undefined);
					}
				}
			}
		}

		if (event.type === Blockly.Events.MOVE) {
			const moveEvent = event as Blockly.Events.BlockMove;
			const toolbox = this.workspace.getToolbox() as Blockly.Toolbox;
			const toolWorkspace = toolbox.getFlyout()?.getWorkspace();

			if (!(toolWorkspace && this.blockName)) return;

			const block = toolWorkspace.getBlocksByType(this.blockName);
			if (moveEvent?.blockId === block[0]?.id && this.onUserMovedTargetBlock) {
				this.highlightInstance?.dispose();
				this.onUserMovedTargetBlock();
			}
		}
	};

	highlightBlock(blockName: string) {
		this.disposeHighlight();
		this.blockName = blockName;
		this.highlightCategory();
		this.workspace.addChangeListener(this.onToolboxOpen);
	}

	disposeHighlight() {
		this.workspace.removeChangeListener(this.onToolboxOpen);
		if (this.highlightInstance) {
			this.highlightInstance.dispose();
			this.highlightInstance = null;
		}
		this.blockName = null;
	}
}
