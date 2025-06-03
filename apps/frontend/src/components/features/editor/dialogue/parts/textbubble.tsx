import { renderAIaudioBubble } from "@/components/features/editor/dialogue/parts/bubbles/aiAudioBubble";
import { renderAIBubble } from "@/components/features/editor/dialogue/parts/bubbles/aiBubble";
import { renderGroupLogBubble } from "@/components/features/editor/dialogue/parts/bubbles/groupLogBubble";
import { renderLogBubble } from "@/components/features/editor/dialogue/parts/bubbles/logBubble";
import { renderErrorBubble } from "@/components/features/editor/dialogue/parts/bubbles/renderErrorBubble";
import { renderUserAudioBubble } from "@/components/features/editor/dialogue/parts/bubbles/userAudioBubble";
import { renderUserBubble } from "@/components/features/editor/dialogue/parts/bubbles/userBubble";
import getMarkdownComponents from "@/components/features/editor/dialogue/parts/markdown";
import { SelectTutorialUI } from "@/components/features/editor/dialogue/parts/ui/tutorialSelectorUI";
import { useConfig } from "@/hooks/config.js";
import type { SessionValue } from "@/type.js";
import React, {
	type Dispatch,
	type SetStateAction,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { useTranslation } from "react-i18next";

const TextBubble = React.forwardRef(function TextBubble(
	{
		currentSession,
		setCurrentSession,
		item,
		easyMode,
		className,
		"data-index": index,
	}: {
		currentSession: SessionValue;
		setCurrentSession: Dispatch<SetStateAction<SessionValue | null>>;
		item: NonNullable<SessionValue["dialogue"]>[number];
		easyMode: boolean;
		className?: string;
		"data-index": number;
	},
	ref: React.Ref<HTMLDivElement | null>,
) {
	const bubbleRef = useRef<HTMLDivElement | null>(null);

	// Side effects for calling `measureElement
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
	}, [ref, item]);

	// Load configuration
	const { config } = useConfig();
	const { t } = useTranslation();

	// Get markdown component
	const markdownComponents = useMemo(() => {
		return getMarkdownComponents(t, currentSession?.workspace);
	}, [t]);

	// Rendering the contents of the bubble
	const renderBubbleContent = () => {
		const content = item.content as string;

		switch (item.contentType) {
			case "user":
				return renderUserBubble(content, markdownComponents, t, item.id);
			case "user_audio":
				return renderUserAudioBubble(content, t, item.id);
			case "ai":
				return renderAIBubble(
					content,
					markdownComponents,
					t,
					item.id,
					easyMode,
				);
			case "ai_audio":
				return renderAIaudioBubble(content, t, item.id);
			case "ui":
				return item.ui === "selectTutorial" ? (
					<SelectTutorialUI setSessionState={setCurrentSession} />
				) : null;
			case "log":
				return renderLogBubble(content, markdownComponents, t, item.id);
			case "error":
				return renderErrorBubble(content, markdownComponents, t, item.id);
			case "group_log":
				return Array.isArray(item.content)
					? renderGroupLogBubble(
							item.content,
							markdownComponents,
							t,
							config,
							item.id,
						)
					: null;
			default:
				return null;
		}
	};

	return (
		<div
			className={`${className} px-4 py-2`}
			ref={bubbleRef}
			data-index={index}
		>
			{renderBubbleContent()}
		</div>
	);
});

export default TextBubble;
