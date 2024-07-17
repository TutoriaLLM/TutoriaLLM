import * as Blockly from "blockly/core";
import { useEffect, useRef } from "react";

import registerBlocks from "./blocks";
import Theme from "./theme";
import { toolboxCategories, translateCategories } from "./toolbox";
import { blocklyLocale } from "../../../../i18n/blocklyLocale";
import "../../../styles/blockly.css";
import { useAtom, useAtomValue } from "jotai";
import {
	blockNameFromMenuState,
	currentSessionState,
	highlightedBlockState,
	prevSessionState,
} from "../../../state";
import { BlockHighlight } from "./blockHighlight";
import { updateStats } from "../../../../utils/statsUpdater";

export default function Editor() {
	const [currentSession, setCurrentSession] = useAtom(currentSessionState);
	const prevSession = useAtomValue(prevSessionState);
	const [blockNameFromMenu, setBlockNameFromMenu] = useAtom(
		blockNameFromMenuState,
	);
	const [highlightedBlock, setHighlightedBlock] = useAtom(
		highlightedBlockState,
	);

	const blockHighlightRef = useRef<BlockHighlight | null>(null);

	useEffect(() => {
		const language = currentSession?.language;
		console.log("langState", language);
		if (language && blocklyLocale[language]) {
			console.log("Setting Blockly locale to", language);
			Blockly.setLocale(blocklyLocale[language]);
		} else {
			console.log("Setting Blockly locale to English");
			Blockly.setLocale(blocklyLocale.en);
		}

		async function getWorkspace() {
			const workspaceArea = document.getElementById("workspaceArea");
			if (workspaceArea) {
				const resizeObserver = new ResizeObserver((entries) => {
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
			theme: Theme,
			renderer: "zelos",
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

		if (currentSession?.workspace) {
			Blockly.serialization.workspaces.load(
				currentSession.workspace,
				workspace,
			);
		}

		const toolbox = workspace.getToolbox() as Blockly.Toolbox;

		//ハイライトするツールボックスの項目がある場合、そのメニュー項目をハイライトする
		const toolboxItem = toolbox.getToolboxItems();
		for (const item of toolboxItem) {
			if (item.isSelectable()) {
				const category = item as Blockly.ToolboxCategory;

				const stringifiedContents = JSON.stringify(category.getContents());
				if (
					blockNameFromMenu &&
					stringifiedContents.includes(blockNameFromMenu)
				) {
					console.log("Found block in toolbox:", blockNameFromMenu);
					//カテゴリ名が一致する場合、そのカテゴリの色を変更する
					const div = category.getDiv();
					const labelDOM = div?.getElementsByClassName(
						"blocklyTreeRow",
					)[0] as HTMLElement;
					if (labelDOM) {
						labelDOM.style.backgroundColor = "#ef4444";
						labelDOM.classList.add("highlight");
						//highlightはCSSファイル内で定義されている
					}
				}
			}
		}

		const saveWorkspace = (event: Blockly.Events.Abstract) => {
			try {
				if (
					event.type === Blockly.Events.CHANGE ||
					event.type === Blockly.Events.DELETE ||
					event.type === Blockly.Events.FINISHED_LOADING ||
					event.type === Blockly.Events.MOVE
				) {
					console.log("event type:", event.type);
					if (event.type === Blockly.Events.MOVE) {
						const moveEvent = event as Blockly.Events.BlockMove;
						if (Array.isArray(moveEvent.reason)) {
							if (moveEvent.reason.includes("disconnect")) {
								console.log("Block disconnection detected, not saving.");
								return;
							}
						}
					}

					const newWorkspace = Blockly.serialization.workspaces.save(workspace);
					setCurrentSession((prev) => {
						if (
							prev &&
							JSON.stringify(prev.workspace) !== JSON.stringify(newWorkspace)
						) {
							return {
								...prev,
								workspace: newWorkspace,
								stats: updateStats(
									{
										currentNumOfBlocks: workspace.getAllBlocks().length,
									},
									prev,
								).stats,
							};
						}
						return prev;
					});
				}
				if (event.type === Blockly.Events.TOOLBOX_ITEM_SELECT) {
					console.log("Toolbox item selected");
					//カテゴリを開いている際に、Stateからツールボックス内の探す必要のあるブロックがある場合は、そのブロックを探し、ツールボックス内のワークスペースでハイライトする
					if (
						blockNameFromMenu &&
						toolbox.getSelectedItem() !== (null || undefined)
					) {
						console.log(
							"Toolbox item selected, highlighting block. selected item:",
							toolbox.getSelectedItem(),
						);
						try {
							const flyout = toolbox.getFlyout();
							const workspace = flyout?.getWorkspace();
							const block = workspace?.getBlocksByType(blockNameFromMenu);

							if (block && block.length > 0 && workspace) {
								//ハイライトする
								setHighlightedBlock({
									workspace: workspace,
									blockId: block[0].id,
								});
							}
							//ブロックが存在しない場合は、空のidからハイライトする
							if (block && block.length === 0 && workspace) {
								setHighlightedBlock({
									workspace: workspace,
									blockId: "",
								});
							}
						} catch (error) {
							console.log(
								"Error in saveWorkspace, toolbox item select:",
								error,
							);
							return null;
						}
					}
					//カテゴリを閉じた場合は、ハイライトを解除する
					if (toolbox.getFlyout()?.isVisible() === false) {
						console.log("Flyout is closed, clearing highlighted block");
						setHighlightedBlock(null);
					}
				}
				//メニューから指定したブロックが移動された場合、ハイライトを解除する
				if (event.type === Blockly.Events.MOVE) {
					const moveEvent = event as Blockly.Events.BlockMove;
					const toolbox = workspace.getToolbox() as Blockly.Toolbox;
					const toolWorkspace = toolbox.getFlyout()?.getWorkspace();
					if (!toolWorkspace || !blockNameFromMenu) {
						return;
					}
					const block = toolWorkspace.getBlocksByType(blockNameFromMenu);
					if (moveEvent?.blockId === block[0]?.id) {
						console.log("Block moved from toolbox, clearing highlighted block");
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

	useEffect(() => {
		const workspace = Blockly.getMainWorkspace() as Blockly.WorkspaceSvg;
		if (
			currentSession &&
			prevSession &&
			currentSession.workspace !== prevSession.workspace
		) {
			try {
				Blockly.serialization.workspaces.load(
					currentSession.workspace,
					workspace,
				);
				console.log("workspace refreshed from currentSession state");
				//ハイライトを解除する
				setHighlightedBlock(null);
			} catch (error) {
				console.error("Failed to load the workspace:", error);
			}
		}
	}, [currentSession, prevSession]);

	// ハイライトされたブロックを更新。１つ以上ハイライトはできない。
	useEffect(() => {
		console.log("highlightedBlock changed", highlightedBlock);

		if (blockHighlightRef.current) {
			blockHighlightRef.current.dispose();
		}

		if (highlightedBlock) {
			blockHighlightRef.current = new BlockHighlight(
				highlightedBlock.workspace ||
					(Blockly.getMainWorkspace() as Blockly.WorkspaceSvg),
			);
			blockHighlightRef.current.init(10, highlightedBlock.blockId);
		} else {
			blockHighlightRef.current = null;
		}
	}, [highlightedBlock]);

	return <div id="blocklyDiv" className="w-full h-full" />;
}
