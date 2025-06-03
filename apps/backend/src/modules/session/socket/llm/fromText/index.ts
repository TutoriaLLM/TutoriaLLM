import type { Guide } from "@/db/schema";
import type { SessionValue } from "@/modules/session/schema";
import {
	audioDialogueSystemTemplate,
	audioDialogueUserTemplate,
	dialogueSystemTemplate,
	dialogueUserTemplate,
	simplifyDialogue,
} from "@/prompts/guidance";
import { langToStr } from "@/utils/langToStr";
import { fillPrompt } from "@/utils/prompts";
import stringifyKnowledge from "@/utils/stringifyKnowledge";
import { textToAudio } from "./textToAudio";
import { textFromText } from "./textToText";
import { getConfig } from "@/modules/config";

export async function generateResponseFromText({
	responseMode,
	session,
	knowledge,
	tutorialContent,
	lastMessage,
	allBlocks,
	ui,
}: {
	responseMode: "text" | "audio";
	session: SessionValue;
	knowledge: Guide[] | string;
	tutorialContent: string | { content: string } | undefined;
	lastMessage: string;
	allBlocks: string[];
	ui: { ui: string; description: string; warn: string }[];
}) {
	const config = getConfig();

	/**
	 * For text to text
	 */
	const userTemplate = fillPrompt(dialogueUserTemplate, {
		dialogueHistory: JSON.stringify(await simplifyDialogue(session, 50)),
		tutorialContent: JSON.stringify(tutorialContent),
		knowledge: stringifyKnowledge(knowledge),
		lastMessage,
		easyMode: String(session.easyMode),
		workspace: JSON.stringify(session.workspace),
	});
	const systemPrompt = fillPrompt(dialogueSystemTemplate, {
		language: langToStr(session.language || "en") || "en",
		allBlocks: allBlocks.toString(),
		uiElements: ui
			.map((u) => `${u.ui} - ${u.description} ${u.warn}`)
			.join("\n"),
	});

	/**
	 * For text to audio
	 */
	const audioUserTemplate = fillPrompt(audioDialogueUserTemplate, {
		dialogueHistory: JSON.stringify(await simplifyDialogue(session, 50)),
		tutorialContent: JSON.stringify(tutorialContent),
		knowledge: stringifyKnowledge(knowledge),
		lastMessage,
		easyMode: String(session.easyMode),
		workspace: JSON.stringify(session.workspace),
	});
	const audioSystemPrompt = fillPrompt(audioDialogueSystemTemplate, {
		language: langToStr(session.language || "en") || "en",
	});

	function generateResponse() {
		if (responseMode === "audio") {
			return textToAudio(audioSystemPrompt, audioUserTemplate);
		}
		return textFromText(
			config.AI_Settings.Chat_AI_Model,
			config.AI_Settings.Chat_AI_Temperature,
			systemPrompt,
			userTemplate,
		);
	}

	const response = await generateResponse();

	return response;
}
