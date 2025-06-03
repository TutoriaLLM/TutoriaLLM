import type { SessionValue } from "@/modules/session/schema";
import {
	audioDialogueSystemTemplate,
	audioDialogueUserTemplate,
	dialogueSystemTemplate,
	dialogueUserTemplate,
	simplifyDialogue,
} from "@/prompts/guidance";
import { fillPrompt } from "@/utils/prompts";
import stringifyKnowledge from "@/utils/stringifyKnowledge";
import { langToStr } from "@/utils/langToStr";
import { audioToAudio } from "./audioToAudio";
import { audioToText } from "./audioToText";

export async function generateResponseFromAudio({
	responseMode,
	session,
	base64Wav,
	tutorialContent,
	allBlocks,
	ui,
}: {
	responseMode: "text" | "audio";
	session: SessionValue;
	base64Wav: string;
	tutorialContent: string | { content: string } | undefined;
	allBlocks: string[];
	ui: { ui: string; description: string; warn: string }[];
}) {
	/**
	 * For audio to text
	 */
	const userPrompt = fillPrompt(dialogueUserTemplate, {
		dialogueHistory: JSON.stringify(await simplifyDialogue(session, 50)),
		tutorialContent: JSON.stringify(tutorialContent),
		knowledge: stringifyKnowledge(""),
		lastMessage: "The user sent an audio message.",
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
	 * For audio to audio
	 */
	const audioUserTemplate = fillPrompt(audioDialogueUserTemplate, {
		dialogueHistory: JSON.stringify(await simplifyDialogue(session, 50)),
		tutorialContent: JSON.stringify(tutorialContent),
		knowledge: stringifyKnowledge(""),
		lastMessage: "The user sent an audio message.",
		easyMode: String(session.easyMode),
		workspace: JSON.stringify(session.workspace),
	});
	const audioSystemPrompt = fillPrompt(audioDialogueSystemTemplate, {
		language: langToStr(session.language || "en") || "en",
	});

	function generateResponse() {
		if (responseMode === "audio") {
			return audioToAudio(base64Wav, audioSystemPrompt, audioUserTemplate);
		}
		return audioToText(base64Wav, systemPrompt, userPrompt);
	}

	const response = await generateResponse();

	return response;
}
