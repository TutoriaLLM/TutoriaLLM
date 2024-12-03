import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import { currentSessionState } from "../../../../state.js";
import { renderUserBubble } from "./bubbles/userBubble.js";
import { renderAIBubble } from "./bubbles/aiBubble.js";
import { renderLogBubble } from "./bubbles/logBubble.js";
import { renderErrorBubble } from "./bubbles/renderErrorBubble.js";
import { renderGroupLogBubble } from "./bubbles/groupLogBubble.js";
import { SelectTutorialUI } from "./ui/tutorialSelectorUI.js";
import React, { useEffect, useMemo, useRef } from "react";
import getMarkdownComponents from "./markdown.js";
import { renderAIaudioBubble } from "./bubbles/aiAudioBubble.js";
import { renderUserAudioBubble } from "./bubbles/userAudioBubble.js";
import { useConfig } from "@/hooks/config.js";
import type { SessionValue } from "@/type.js";

const TextBubble = React.forwardRef(function TextBubble(
	props: {
		item: NonNullable<SessionValue["dialogue"]>[number];
		easyMode: boolean;
		className?: string;
		"data-index": number;
	},
	ref: React.Ref<HTMLDivElement | null>,
) {
	const bubbleRef = useRef<HTMLDivElement | null>(null);

	// `measureElement`を呼び出すための副作用
	useEffect(() => {
		if (bubbleRef.current) {
			if (typeof ref === "function") {
				ref(bubbleRef.current);
			} else if (ref) {
				if (ref && "current" in ref) {
					(ref as React.MutableRefObject<HTMLDivElement | null>).current =
						bubbleRef.current;
				}
			}
		}
	}, [ref, props.item]);

	// 設定をロード
	const { config } = useConfig();
	const currenSession = useAtomValue(currentSessionState);
	const { t } = useTranslation();

	// markdownコンポーネントを取得
	const markdownComponents = useMemo(() => {
		return getMarkdownComponents(t, currenSession?.workspace);
	}, [t]);

	// バブルの内容をレンダリング
	const renderBubbleContent = () => {
		const content = props.item.content as string;

		switch (props.item.contentType) {
			case "user":
				return renderUserBubble(content, markdownComponents, t, props.item.id);
			case "user_audio":
				return renderUserAudioBubble(content, t, props.item.id);
			case "ai":
				return renderAIBubble(
					content,
					markdownComponents,
					t,
					props.item.id,
					props.easyMode,
				);
			case "ai_audio":
				return renderAIaudioBubble(
					content,
					markdownComponents,
					t,
					props.item.id,
					currenSession?.audios ?? [],
					props.easyMode,
				);
			case "ui":
				return props.item.ui === "selectTutorial" ? <SelectTutorialUI /> : null;
			case "log":
				return renderLogBubble(content, markdownComponents, t, props.item.id);
			case "error":
				return renderErrorBubble(content, markdownComponents, t, props.item.id);
			case "group_log":
				return Array.isArray(props.item.content)
					? renderGroupLogBubble(
							props.item.content,
							markdownComponents,
							t,
							config,
							props.item.id,
						)
					: null;
			default:
				return null;
		}
	};

	return (
		<div
			className={`${props.className} px-4 py-2`}
			ref={bubbleRef}
			data-index={props["data-index"]}
		>
			{renderBubbleContent()}
		</div>
	);
});

export default TextBubble;
