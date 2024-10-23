import { useTranslation } from "react-i18next";
import type { Dialogue } from "../../../../../type.js";
import { useAtomValue } from "jotai";
import { currentSessionState, settingState } from "../../../../state.js";
import { renderUserBubble } from "./bubbles/userBubble.js";
import { renderAIBubble } from "./bubbles/aiBubble.js";
import { renderLogBubble } from "./bubbles/logBubble.js";
import { renderErrorBubble } from "./bubbles/renderErrorBubble.js";
import { renderGroupLogBubble } from "./bubbles/groupLogBubble.js";
import { SelectTutorialUI } from "./ui/tutorialSelectorUI.js";
import React from "react";
import getMarkdownComponents from "./markdown.js";
import { renderAIaudioBubble } from "./bubbles/aiAudioBubble.js";
import { renderUserAudioBubble } from "./bubbles/userAudioBubble.js";

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

		const currenSession = useAtomValue(currentSessionState);

		const { t } = useTranslation();

		// highlightText関数内で使用するために、handleBlockNameClickとblockNameFromMenuを定義
		const content = props.item.content as string;

		const markdownComponents = getMarkdownComponents(
			t,
			currenSession?.workspace,
		);

		return (
			<>
				{props.item.contentType === "user" &&
					renderUserBubble(content, markdownComponents, t, props.item.id)}
				{props.item.contentType === "user_audio" &&
					renderUserAudioBubble(content, t, props.item.id)}

				{props.item.contentType === "ai" &&
					renderAIBubble(
						content,
						markdownComponents,
						t,
						props.item.id,
						props.easyMode,
					)}
				{props.item.contentType === "ai_audio" &&
					renderAIaudioBubble(
						content,
						markdownComponents,
						t,
						props.item.id,
						currenSession?.audios,
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
			</>
		);
	}),
);

export default TextBubble;
