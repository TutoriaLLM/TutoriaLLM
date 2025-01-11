import * as Blockly from "blockly/core";
import { type Dispatch, type SetStateAction, useEffect, useRef } from "react";

import registerBlocks from "@/components/common/Blockly/blocks";
import Theme from "@/components/common/Blockly/theme";
import {
	toolboxCategories,
	translateCategories,
} from "@/components/common/Blockly/toolbox";
import "@/styles/blockly.css";
import { BlockHighlight } from "@/components/common/Blockly/blockHighlight";
import { blockNameFromMenuState, highlightedBlockState } from "@/state.js";
import { useAtom } from "jotai";

import { blocklyLocale } from "@/i18n/blocklyLocale.js";
import { forwardRef } from "react";

const Editor = forwardRef<
	HTMLDivElement,
	{
		menuOpen: boolean;
		language: string;
		currentWorkspace: {
			[x: string]: any;
		} | null;
		setWorkspace: Dispatch<SetStateAction<{ [x: string]: any } | null>>;
		prevWorkspace: {
			[x: string]: any;
		} | null;
	}
>(
	(
		{ menuOpen, language, currentWorkspace, setWorkspace, prevWorkspace },
		ref,
	) => {
		const [blockNameFromMenu, setBlockNameFromMenu] = useAtom(
			blockNameFromMenuState,
		);
		const [highlightedBlock, setHighlightedBlock] = useAtom(
			highlightedBlockState,
		);

		const blockHighlightRef = useRef<BlockHighlight | null>(null);

		useEffect(() => {
			if (language && blocklyLocale[language]) {
				Blockly.setLocale(blocklyLocale[language]);
			} else {
				Blockly.setLocale(blocklyLocale.en);
			}

			async function getWorkspace() {
				const workspaceArea = document.getElementById("workspaceArea");
				if (workspaceArea) {
					const resizeObserver = new ResizeObserver(() => {
						onResize();
					});
					resizeObserver.observe(workspaceArea);
				}

				function onResize() {
					const workspace = Blockly.getMainWorkspace() as Blockly.WorkspaceSvg;
					Blockly.svgResize(workspace);
				}
			}

			getWorkspace();
			registerBlocks(language as string);
			translateCategories(language as string);

			const workspace = Blockly.inject("blocklyDiv", {
				toolbox: toolboxCategories,
				sounds: false,
				theme: Theme,
				renderer: "zelos",
				media: "/",
				zoom: {
					controls: true,
					wheel: true,
					startScale: 1.0,
					maxScale: 3,
					minScale: 0.3,
					scaleSpeed: 1.2,
				},
				trashcan: false,
				move: {
					scrollbars: true,
					drag: true,
					wheel: true,
				},
				grid: {
					spacing: 20,
					length: 3,
					colour: "#ccc",
					snap: true,
				},
			});

			if (currentWorkspace) {
				Blockly.serialization.workspaces.load(currentWorkspace, workspace);
			}
			workspace.addChangeListener(Blockly.Events.disableOrphans);

			const toolbox = workspace.getToolbox() as Blockly.Toolbox;

			// Highlight the menu item in the toolbox item to be highlighted, if any
			const toolboxItem = toolbox.getToolboxItems();
			// Function to highlight a category and its parent categories
			function highlightCategory(category: Blockly.ToolboxCategory) {
				const div = category.getDiv();
				const labelDOM = div?.getElementsByClassName(
					"blocklyTreeRow",
				)[0] as HTMLElement;
				if (labelDOM) {
					labelDOM.style.backgroundColor = "#ef4444";
					labelDOM.classList.add("highlight"); // highlight is defined in the CSS file
				}
			}
			// Function to highlight everything up to the top level hierarchy
			function highlightParentCategory(category: Blockly.ToolboxCategory) {
				let parent = category.getParent();
				while (parent) {
					const parentCategory = parent as Blockly.CollapsibleToolboxCategory;
					parent = parentCategory.getParent();
					highlightCategory(parentCategory);
					highlightParentCategory(parentCategory);
				}
			}
			function highlightBlockInToolbox() {
				for (const item of toolboxItem) {
					if (item.isSelectable()) {
						const category = item as
							| Blockly.ToolboxCategory
							| Blockly.CollapsibleToolboxCategory;

						const contents = category.getContents();
						if (
							typeof contents !== "string" &&
							blockNameFromMenu &&
							containsBlockType(contents, blockNameFromMenu)
						) {
							// If the category name matches, change the color of that category
							highlightCategory(category);
						}
					}
					if (item.isCollapsible()) {
						const category = item as Blockly.CollapsibleToolboxCategory;
						// Retrieve child items
						const children = category.getChildToolboxItems();
						for (const child of children) {
							const item = child as Blockly.ToolboxCategory;
							const contents = item.getContents();
							if (
								typeof contents !== "string" &&
								blockNameFromMenu &&
								containsBlockType(contents, blockNameFromMenu)
							) {
								// If the category name matches, change the color of that category
								highlightCategory(item);
								// Also change the color of the parent category
								highlightParentCategory(item);
							}
						}
						const contents = category.getContents();
						if (
							typeof contents !== "string" &&
							blockNameFromMenu &&
							containsBlockType(contents, blockNameFromMenu)
						) {
							// If the category name matches, change the color of that category
							highlightCategory(category);
						}
					}
				}
			}

			function containsBlockType(
				contents: Blockly.utils.toolbox.FlyoutItemInfoArray,
				blockType: string,
			): boolean {
				for (const content of contents) {
					// Checks if content is a block and has a type property
					if (
						content.kind === "block" &&
						"type" in content &&
						content.type === blockType
					) {
						return true;
					}
				}
				return false;
			}

			highlightBlockInToolbox();

			const saveWorkspace = (event: Blockly.Events.Abstract) => {
				try {
					if (
						event.type === Blockly.Events.CHANGE ||
						event.type === Blockly.Events.DELETE ||
						event.type === Blockly.Events.FINISHED_LOADING ||
						event.type === Blockly.Events.MOVE
					) {
						if (event.type === Blockly.Events.MOVE) {
							const moveEvent = event as Blockly.Events.BlockMove;
							if (Array.isArray(moveEvent.reason)) {
								if (moveEvent.reason.includes("disconnect")) {
									return;
								}
							}
						}

						const newWorkspace =
							Blockly.serialization.workspaces.save(workspace);
						setWorkspace((prev) => {
							if (
								prev &&
								JSON.stringify(prev) !== JSON.stringify(newWorkspace)
							) {
								return newWorkspace;
							}
							return prev;
						});
					}
					if (event.type === Blockly.Events.TOOLBOX_ITEM_SELECT) {
						// If you have a category open and there is a block you need to find in the toolbox from State, find that block and highlight it in the workspace in the toolbox
						if (
							blockNameFromMenu &&
							toolbox.getSelectedItem() !== null &&
							toolbox.getSelectedItem() !== undefined
						) {
							try {
								const flyout = toolbox.getFlyout();
								const workspace = flyout?.getWorkspace();
								const block = workspace?.getBlocksByType(blockNameFromMenu);

								if (block && block.length > 0 && workspace) {
									// Highlight.
									setHighlightedBlock({
										workspace: workspace,
										blockId: block[0].id,
									});
								}
								// If the block does not exist, highlight from an empty id
								if (block && block.length === 0 && workspace) {
									setHighlightedBlock({
										workspace: workspace,
										blockId: "",
									});
								}
							} catch {
								return null;
							}
						}
						// If the category is closed, de-highlight it
						if (toolbox.getFlyout()?.isVisible() === false) {
							setHighlightedBlock(null);
						}
					}
					// Unhighlight if the block specified in the menu has been moved
					if (event.type === Blockly.Events.MOVE) {
						const moveEvent = event as Blockly.Events.BlockMove;
						const toolbox = workspace.getToolbox() as Blockly.Toolbox;
						const toolWorkspace = toolbox.getFlyout()?.getWorkspace();
						if (!toolWorkspace || !blockNameFromMenu) {
							return;
						}
						const block = toolWorkspace.getBlocksByType(blockNameFromMenu);
						if (moveEvent?.blockId === block[0]?.id) {
							setBlockNameFromMenu(null);
						}
					}
				} catch (error) {
					console.error("Error in saveWorkspace:", error);
				}
			};

			workspace.addChangeListener(saveWorkspace);

			return () => {
				workspace.dispose();
			};
		}, [blockNameFromMenu]);

		// Hide/Show toolbox
		useEffect(() => {
			const workspace = Blockly.getMainWorkspace() as Blockly.WorkspaceSvg;
			if (workspace) {
				workspace.getToolbox()?.setVisible(menuOpen);
				workspace.getToolbox()?.getFlyout()?.setVisible(menuOpen);
			}
		}, [menuOpen]);

		useEffect(() => {
			const workspace = Blockly.getMainWorkspace() as Blockly.WorkspaceSvg;

			if (currentWorkspace && prevWorkspace) {
				try {
					Blockly.serialization.workspaces.load(
						currentWorkspace || {},
						workspace,
					);
					// Unhighlight
					setHighlightedBlock(null);
				} catch (error) {
					console.error("Failed to load the workspace:", error);
				}
			}
		}, [currentWorkspace, prevWorkspace]);

		// Update highlighted blocks; cannot highlight more than one.
		useEffect(() => {
			if (blockHighlightRef.current) {
				blockHighlightRef.current.dispose();
			}

			if (highlightedBlock) {
				const currentWorkspace =
					Blockly.getMainWorkspace() as Blockly.WorkspaceSvg;
				blockHighlightRef.current = new BlockHighlight(
					highlightedBlock.workspace || currentWorkspace,
				);
				blockHighlightRef.current.init(10, highlightedBlock.blockId);
			} else {
				blockHighlightRef.current = null;
			}
		}, [highlightedBlock]);

		return <div ref={ref} id="blocklyDiv" className="w-full h-full relative" />;
	},
);

export default Editor;
