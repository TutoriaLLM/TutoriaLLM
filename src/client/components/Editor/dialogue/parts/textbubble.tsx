import { useTranslation } from "react-i18next";
import type { Dialogue } from "../../../../../type.js";
import type { Components } from "react-markdown";

import type * as Blockly from "blockly";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
	blockNameFromMenuState,
	currentTabState,
	highlightedBlockState,
	settingState,
} from "../../../../state.js";
import * as Accordion from "@radix-ui/react-accordion";
import { renderUserBubble } from "./bubbles/userBubble.js";
import type { TFunction } from "i18next";
import { renderAIBubble } from "./bubbles/aiBubble.js";
import { renderLogBubble } from "./bubbles/logBubble.js";
import { renderErrorBubble } from "./bubbles/renderErrorBubble.js";
import { renderGroupLogBubble } from "./bubbles/groupLogBubble.js";
import { renderBlockIdBubble } from "./bubbles/blockidBubble.js";
import { renderBlockNameBubble } from "./bubbles/blocknameBubble.js";
import { SelectTutorialUI } from "./ui/tutorialSelectorUI.js";
import React, {
	useEffect,
	useRef,
	useState,
	useCallback,
	useMemo,
} from "react";
import { getExternalBlocks } from "../../Blockly/blocks/index.js";
import { listAllBlocks } from "../../../../../utils/blockList.js";
import generateImageFromBlockName from "../../generateImageFromBlockName.js";
import {
	getImageFromIndexedDB,
	saveImageToIndexedDB,
} from "../../../../indexedDB.js";

const TextBubble = React.memo(
	React.forwardRef(function TextBubble(
		props: {
			item: Dialogue;
			easyMode: boolean;
		},
		ref,
	) {
		//load setting
		const setting = useAtomValue(settingState);

		const [highlightedBlock, setHighlightedBlock] = useAtom(
			highlightedBlockState,
		);
		const [blockNameFromMenu, setBlockNameFromMenu] = useAtom(
			blockNameFromMenuState,
		);
		const setActiveTab = useSetAtom(currentTabState);

		const { t } = useTranslation();

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
			[
				highlightedBlock,
				setHighlightedBlock,
				setBlockNameFromMenu,
				setActiveTab,
			],
		);

		const handleBlockNameClick = useCallback(
			(blockName: string) => {
				if (blockNameFromMenu === blockName) {
					//スイッチオフ
					setBlockNameFromMenu(null);
				} else {
					//スイッチオン
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

		const content = props.item.content as string;

		// <code>タグの内容をコピーするための関数
		const handleCodeCopy = useCallback(
			(code: string) => {
				navigator.clipboard.writeText(code).then(() => {
					alert(t("textbubble.copiedToClipboard"));
				});
			},
			[t],
		);

		// テキストをハイライトする関数
		function highlightText(
			node: React.ReactNode,
			targetStrings: string[],
		): React.ReactNode {
			if (typeof node === "string" || typeof node === "number") {
				const text = node.toString();
				const regex = new RegExp(`(${targetStrings.join("|")})`, "g");
				const parts = text.split(regex);

				return parts.map((part, index) => {
					if (targetStrings.includes(part)) {
						return <HighlightedText key={index} text={part} />;
					}
					return part;
				});
			}
			if (React.isValidElement(node) && node.props.children) {
				return React.cloneElement(
					node,
					{ ...node.props },
					highlightText(node.props.children, targetStrings),
				);
			}
			if (Array.isArray(node)) {
				return node.map((child) => highlightText(child, targetStrings));
			}
			return node;
		}

		function HighlightedText({ text }: { text: string }) {
			const [image, setImage] = useState<string | null>(null);
			const hiddenWorkspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
			const hiddenDivRef = useRef<HTMLDivElement | null>(null);

			useEffect(() => {
				const fetchImage = async () => {
					// IndexedDBからキャッシュを確認
					const cachedImage = await getImageFromIndexedDB(`image_${text}`);
					if (cachedImage) {
						setImage(cachedImage);
					} else {
						const generatedImage = await generateImageFromBlockName(
							hiddenWorkspaceRef,
							hiddenDivRef,
							text,
						);
						setImage(generatedImage);
						// IndexedDBに保存
						await saveImageToIndexedDB(`image_${text}`, generatedImage);
					}
				};
				fetchImage();

				// クリーンアップ関数
				return () => {
					if (hiddenDivRef.current) {
						try {
							hiddenDivRef.current.remove();
						} catch (error) {
							console.warn("Failed to remove hidden div", error);
						}
						hiddenDivRef.current = null;
					}
				};
			}, [text]);

			return (
				<span className="text-red-500 max-h-8">
					{text}
					{image && <img src={image} alt={text} />}
				</span>
			);
		}

		// 共通のハイライト処理関数
		const renderWithHighlight = useCallback((node: any, props: any) => {
			const externalBlocks = getExternalBlocks();
			const allBlocks = listAllBlocks(externalBlocks);

			const highlightedChildren = highlightText(props.children, allBlocks);
			return node
				? React.createElement(node.tagName, props, highlightedChildren)
				: null;
		}, []);

		// Markdownのカスタムレンダリング設定
		const markdownComponents: Components = useMemo(
			() => ({
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
			}),
			[handleCodeCopy, renderWithHighlight],
		);

		return (
			<>
				{props.item.contentType === "user" &&
					renderUserBubble(content, markdownComponents, t, props.item.id)}
				{props.item.contentType === "ai" &&
					renderAIBubble(
						content,
						markdownComponents,
						t,
						props.item.id,
						props.easyMode,
					)}
				{props.item.contentType === "ui" &&
					props.item.ui === "selectTutorial" && <SelectTutorialUI />}
				{props.item.contentType === "log" &&
					renderLogBubble(content, markdownComponents, t, props.item.id)}
				{props.item.contentType === "error" &&
					renderErrorBubble(content, markdownComponents, t, props.item.id)}
				{props.item.contentType === "group_log" &&
					Array.isArray(props.item.content) &&
					renderGroupLogBubble(
						props.item.content,
						markdownComponents,
						t,
						setting,
						props.item.id,
					)}
				{props.item.contentType === "blockId" &&
					renderBlockIdBubble(
						content,
						t,
						highlightedBlock,
						handleHighlightClick,
						props.item.id,
					)}
				{props.item.contentType === "blockName" &&
					renderBlockNameBubble(
						content,
						t,
						blockNameFromMenu,
						handleBlockNameClick,
						props.item.id,
					)}
			</>
		);
	}),
);

export default TextBubble;
