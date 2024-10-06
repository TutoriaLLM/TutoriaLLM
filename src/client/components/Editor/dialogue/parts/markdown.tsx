import { useTranslation } from "react-i18next";
import type { Components } from "react-markdown";

import type * as Blockly from "blockly";

import { useAtom, useSetAtom } from "jotai";
import {
	blockNameFromMenuState,
	currentTabState,
	highlightedBlockState,
} from "../../../../state.js";
import type { TFunction } from "i18next";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { getExternalBlocks } from "../../Blockly/blocks/index.js";
import { listAllBlocks } from "../../../../../utils/blockList.js";
import generateImageFromBlockName from "../../generateImageFromBlockName.js";
import {
	getImageFromIndexedDB,
	saveImageToIndexedDB,
} from "../../../../indexedDB.js";
import { ScanSearch, X } from "lucide-react";
import type { SessionValue } from "../../../../../type.js";
import { HighlightedBlockId, HighlightedBlockName } from "./highlight.js";

// テキストをハイライトする関数
function highlightText(
	node: React.ReactNode,
	allBlocks: string[],
	blockIdList: string[],
): React.ReactNode {
	const [blockNameFromMenu, setBlockNameFromMenu] = useAtom(
		blockNameFromMenuState,
	);
	const [highlightedBlock, setHighlightedBlock] = useAtom(
		highlightedBlockState,
	);
	const setActiveTab = useSetAtom(currentTabState);

	const handleBlockNameClick = useCallback(
		(blockName: string) => {
			if (blockNameFromMenu === blockName) {
				// スイッチオフ
				console.log("Turning off the block name:", blockName);
				setBlockNameFromMenu(null);
			} else {
				// スイッチオン
				console.log("Turning on the block name:", blockName);
				setBlockNameFromMenu(blockName);
				setHighlightedBlock(null);
				setActiveTab("workspaceTab");
			}
		},
		[
			blockNameFromMenu,
			setBlockNameFromMenu,
			setHighlightedBlock,
			setActiveTab,
		],
	);
	const handleHighlightClick = useCallback(
		(blockId: string) => {
			if (highlightedBlock?.blockId === blockId) {
				//スイッチオフ
				setHighlightedBlock(null);
			} else {
				//スイッチオン
				setHighlightedBlock({ blockId, workspace: null });
				setBlockNameFromMenu(null);
				setActiveTab("workspaceTab");
			}
		},
		[highlightedBlock, setHighlightedBlock, setBlockNameFromMenu, setActiveTab],
	);

	if (typeof node === "string" || typeof node === "number") {
		const text = node.toString();
		const regex = new RegExp(
			`(${[...allBlocks, ...blockIdList].map(escapeRegExp).join("|")})`,
			"g",
		);

		function escapeRegExp(string: string) {
			return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
		}

		const parts = text.split(regex);

		return parts.map((part, index) => {
			console.log("part", part);
			//ブロック名が含まれている場合はハイライト
			if (allBlocks.includes(part)) {
				return (
					<HighlightedBlockName
						text={part}
						handleBlockNameClick={handleBlockNameClick}
					/>
				);
			}
			//ブロックIDが含まれている場合はハイライト
			if (blockIdList.includes(part)) {
				return (
					<HighlightedBlockId
						text={part}
						handleBlockIdClick={handleHighlightClick}
					/>
				);
			}
			return part;
		});
	}
	if (React.isValidElement(node) && node.props.children) {
		return React.cloneElement(
			node,
			{ ...node.props },
			highlightText(node.props.children, allBlocks, blockIdList),
		);
	}
	if (Array.isArray(node)) {
		return node.map((child) => highlightText(child, allBlocks, blockIdList));
	}
	return node;
}

// markdownComponentsを返す関数
function getMarkdownComponents(
	t: TFunction,
	workspace: SessionValue["workspace"] | undefined,
) {
	// 共通のハイライト処理関数
	const renderWithHighlight = (node: any, props: any) => {
		//ブロック名のリストを取得
		const externalBlocks = getExternalBlocks();
		const allBlocks = listAllBlocks(externalBlocks);

		// 再帰的にブロックのidを取り出す関数
		const extractIdsRecursively = (obj: any): string[] => {
			let ids: string[] = [];

			// オブジェクトがBlockのidプロパティを持っている場合、そのidを追加
			if (obj && typeof obj === "object" && "id" in obj) {
				ids.push(obj.id);
			}

			// オブジェクトの各プロパティを探索
			for (const key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					const value = obj[key];

					// プロパティの値がオブジェクトの場合、再帰的に探索
					if (typeof value === "object" && value !== null) {
						// 配列の場合も対応
						if (Array.isArray(value)) {
							for (const item of value) {
								ids = ids.concat(extractIdsRecursively(item));
							}
						} else {
							ids = ids.concat(extractIdsRecursively(value));
						}
					}
				}
			}

			return ids;
		};

		const blockIdList = extractIdsRecursively(workspace);

		const highlightedChildren = highlightText(
			props.children,
			allBlocks,
			blockIdList,
		);
		return node
			? React.createElement(node.tagName, props, highlightedChildren)
			: null;
	};

	// <code>タグの内容をコピーするための関数
	const handleCodeCopy = (code: string) => {
		navigator.clipboard.writeText(code).then(() => {
			alert(t("textbubble.copiedToClipboard"));
		});
	};

	// Markdownのカスタムレンダリング設定
	const markdownComponents: Components = {
		// 既存のstrongコンポーネントはそのまま
		strong({ node, className, children, ...props }) {
			return (
				// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
				<span
					className="cursor-pointer text-blue-400"
					onClick={() => handleCodeCopy(String(children))}
				>
					<code className={className} {...props}>
						{children}
					</code>
				</span>
			);
		},
		p({ node, ...props }) {
			return renderWithHighlight(node, props);
		},
		li({ node, ...props }) {
			return renderWithHighlight(node, props);
		},
		h1({ node, ...props }) {
			return renderWithHighlight(node, props);
		},
		h2({ node, ...props }) {
			return renderWithHighlight(node, props);
		},
		h3({ node, ...props }) {
			return renderWithHighlight(node, props);
		},
	};

	return markdownComponents;
}

export default getMarkdownComponents;
