import * as Blockly from "blockly/core";
import { useEffect } from "react";

import registerBlocks from "./blocks";
import Theme from "./theme";
// カスタマイズのインポート
import { toolboxCategories, translateCategories } from "./toolbox";

// 言語の読み込み
import { blocklyLocale } from "../../../../i18n/blocklyLocale";

// BlocklyのCSSを上書きする
import "../../../styles/blockly.css";

import { useAtom, useAtomValue } from "jotai";
import { currentSessionState, prevSessionState } from "../../../state";

// エディターを定義する
export default function Editor() {
	const [currentSession, setCurrentSession] = useAtom(currentSessionState);
	const prevSession = useAtomValue(prevSessionState);

	useEffect(() => {
		// Blocklyの言語設定を適用
		const language = currentSession?.language;
		console.log("langState", language);
		if (language && blocklyLocale[language]) {
			console.log("Setting Blockly locale to", language);
			Blockly.setLocale(blocklyLocale[language]);
		} else {
			console.log("Setting Blockly locale to English");
			Blockly.setLocale(blocklyLocale.en);
		}

		// ワークスペースのリサイズを検知してBlocklyをリサイズ
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
		// ブロックを登録する
		registerBlocks(language as string);

		//カテゴリの翻訳を登録する
		translateCategories(language as string);

		// Blocklyのワークスペースを初期化
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

		// セッションが存在する場合はワークスペースを読み込む
		if (currentSession?.workspace) {
			Blockly.serialization.workspaces.load(
				currentSession.workspace,
				workspace,
			);
		}

		// ワークスペースのブロックの変更を検知して保存
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
							// moveEvent.reasonが配列である場合
							// 配列内に'disconnect'が含まれているか確認
							if (moveEvent.reason.includes("disconnect")) {
								console.log("Block disconnection detected, not saving.");
								return;
							}
						}
					}

					// ワークスペースを保存する処理
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

	// currentSessionの変更を前のsessionと比較してワークスペースを更新
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
			} catch (error) {
				console.error("Failed to load the workspace:", error);
			}
		}
	}, [currentSession, prevSession]);

	return <div id="blocklyDiv" className="w-full h-full" />;
}
