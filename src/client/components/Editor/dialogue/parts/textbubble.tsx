import { useTranslation } from "react-i18next";
import type { Dialogue } from "../../../../../type.js";
import type { Components } from "react-markdown";

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
import { BeginTourUI } from "./ui/beginTourUI.js";

export default function TextBubble(props: {
	item: Dialogue;
	easyMode: boolean;
}) {
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

	const handleHighlightClick = (blockId: string) => {
		if (highlightedBlock?.blockId === blockId) {
			//スイッチオフ
			setHighlightedBlock(null);
		} else {
			//スイッチオン
			setHighlightedBlock({ blockId, workspace: null });
			setBlockNameFromMenu(null);
			setActiveTab("workspaceTab");
		}
	};

	const handleBlockNameClick = (blockName: string) => {
		if (blockNameFromMenu === blockName) {
			//スイッチオフ
			setBlockNameFromMenu(null);
		} else {
			//スイッチオン
			setBlockNameFromMenu(blockName);
			setHighlightedBlock(null);
			setActiveTab("workspaceTab");
		}
	};

	const content = props.item.content as string;

	// <code>タグの内容をコピーするための関数
	const handleCodeCopy = (code: string) => {
		navigator.clipboard.writeText(code).then(() => {
			alert(t("textbubble.copiedToClipboard"));
		});
	};

	// Markdownのカスタムレンダリング設定
	const markdownComponents: Components = {
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
	};

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
			{props.item.contentType === "ui" && (
				<>
					{props.item.ui === "selectTutorial" && <SelectTutorialUI />}
					{props.item.ui === "BeginTour" && <BeginTourUI />}
				</>
			)}
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
}
