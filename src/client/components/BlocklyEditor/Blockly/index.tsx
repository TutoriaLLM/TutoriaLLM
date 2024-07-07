import * as Blockly from "blockly/core";
import { useEffect } from "react";

import registerBlocks from "./blocks";
import Theme from "./theme";
import { toolboxCategories, translateCategories } from "./toolbox";
import { blocklyLocale } from "../../../../i18n/blocklyLocale";
import "../../../styles/blockly.css";
import { useAtom, useAtomValue } from "jotai";
import {
	currentSessionState,
	highlightedBlockState,
	prevSessionState,
} from "../../../state";
import { BlockHighlight } from "./blockHighlight";

export default function Editor() {
	const [currentSession, setCurrentSession] = useAtom(currentSessionState);
	const prevSession = useAtomValue(prevSessionState);
	const [highlightedBlock, setHighlightedBlock] = useAtom(
		highlightedBlockState,
	);

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
							};
						}
						return prev;
					});
				}
			} catch (error) {
				console.error("Error in saveWorkspace:", error);
			}
		};

		workspace.addChangeListener(saveWorkspace);

		return () => {
			workspace.dispose();
		};
	}, []);

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
		const workspace = Blockly.getMainWorkspace() as Blockly.WorkspaceSvg;
		const blockHighlight = new BlockHighlight(workspace);
		blockHighlight.dispose();
		if (highlightedBlock) {
			blockHighlight.init(10, highlightedBlock);
		}
	}, [highlightedBlock]);

	return <div id="blocklyDiv" className="w-full h-full" />;
}
