import type { Guide } from "@/db/schema";
import { getKnowledge } from "@/modules/admin/training/utils/knowledge";
import type { SessionValue } from "@/modules/session/schema";
import { listAllBlocks } from "@/utils/blockList";
import generateTrainingData from "@/utils/generateTrainingData";
import { applyRuby } from "@/utils/japaneseWithRuby";
import type { Socket } from "socket.io";
import { generateTranscriptFromAudio } from "./fromAudio/transcript";
import { generateResponseFromText } from "./fromText";
import { generateResponseFromAudio } from "./fromAudio";
import { getTutorialContent } from "./getTutorial";
import { convertWebMToWav } from "@/utils/webmToWav";
import fs from "node:fs";
const ui = [
	{
		ui: "SelectTutorial",
		description:
			"Select a tutorial from the list. If the user already has a tutorial selected, users can override the current tutorial.",
		warn: "Do not use this field if the user already has a tutorial selected or if the user does not need to select a tutorial.",
	},
];

export async function invokeLLM(
	session: SessionValue,
	availableBlocks: string[],
	socket: Socket,
) {
	const allBlocks = listAllBlocks(availableBlocks);

	if (!session.dialogue) {
		console.error("No dialogue found in the session.");
		return null;
	}

	const lastDialogue = session.dialogue[session.dialogue.length - 1];

	if (lastDialogue.contentType === "user_audio" && session.userAudio) {
		const userAudio = session.userAudio.split(",")[1]; // It is in webm format.
		const webmBuffer = Buffer.from(userAudio, "base64");
		const webmPath = `/tmp/${Date.now()}.webm`;
		fs.writeFileSync(webmPath, webmBuffer);

		const wavOutputPath = await convertWebMToWav(webmPath);

		const base64Wav = fs.readFileSync(wavOutputPath).toString("base64");

		await generateTranscriptFromAudio(
			session.sessionId,
			lastDialogue.id,
			socket,
			base64Wav,
		);

		try {
			const tutorialContent = await getTutorialContent(session);

			const response = await generateResponseFromAudio({
				responseMode: session.responseMode,
				session,
				base64Wav,
				tutorialContent,
				allBlocks,
				ui,
			});

			if (!response) {
				console.error("No response from the AI model.");
				return null;
			}

			return response;
		} catch (e) {
			console.error("Error during audio conversion or LLM invocation", e);
			return null;
		}
	}

	const lastMessage = lastDialogue.content.toString();
	const knowledge = (await getKnowledge(lastMessage)) as Guide[] | string;

	const tutorialContent = await getTutorialContent(session);

	const response = await generateResponseFromText({
		responseMode: session.responseMode,
		session,
		knowledge,
		tutorialContent,
		lastMessage,
		allBlocks,
		ui,
	});

	if (!response) {
		console.error("No response from the AI model.");
		return null;
	}

	if ("isQuestion" in response && "formattedUserQuestion" in response) {
		if (response.isQuestion && response.formattedUserQuestion) {
			// If the question is from a user, another AI generates the question as training data
			generateTrainingData(
				response.formattedUserQuestion,
				{
					author: "AI",
					date: new Date().toISOString(),
					sessionId: session.sessionId,
				},
				response.response,
			);
		}
		// Apply furigana to parsedContent
		response.response = await applyRuby(response.response);
	}

	return response;
}
