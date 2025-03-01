import fs from "node:fs";
import { db } from "@/db";
import { type Guide, tutorials } from "@/db/schema";
import { getKnowledge } from "@/modules/admin/training/utils/knowledge";
import { getConfig } from "@/modules/config";
import type { SessionValue } from "@/modules/session/schema";
import { zodTextSchema } from "@/modules/session/socket/llm/responseFormat";
import {
	audioDialogueSystemTemplate,
	audioDialogueUserTemplate,
	dialogueSystemTemplate,
	dialogueUserTemplate,
	simplifyDialogue,
} from "@/prompts/guidance";
import { updateAudioDialogue } from "@/modules/session/socket/llm/whisper";
import { listAllBlocks } from "@/utils/blockList";
import generateTrainingData from "@/utils/generateTrainingData";
import { applyRuby } from "@/utils/japaneseWithRuby";
import { eq } from "drizzle-orm";
import ffmpeg from "fluent-ffmpeg";
import OpenAI from "openai";
import type { Socket } from "socket.io";
import { fillPrompt } from "@/utils/prompts";
import stringifyKnowledge from "@/utils/stringifyKnowledge";
import { generateObject, NoObjectGeneratedError } from "ai";
import { langToStr } from "@/utils/langToStr";
import { openai } from "@/libs/openai";

// OpenAI API client to support audio modality(temporary)
const openaiFromOpenAI = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_API_ENDPOINT || "https://api.openai.com/v1",
});

const ui = [
	{
		ui: "SelectTutorial",
		description:
			"Select a tutorial from the list. If the user already has a tutorial selected, users can override the current tutorial.",
		warn: "Do not use this field if the user already has a tutorial selected or if the user does not need to select a tutorial.",
	},
];

// Converts webm audio format to mp3 format
async function convertWebMToMp3(webmInput: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const mp3Output = `/tmp/${Date.now()}.mp3`;
		ffmpeg(webmInput)
			.output(mp3Output)
			.on("end", () => resolve(mp3Output))
			.on("error", (err: Error) => reject(err))
			.run();
	});
}

// Fetches the tutorial content based on the session value.
async function getTutorialContent(session: SessionValue) {
	if (
		session.tutorial.tutorialId &&
		typeof session.tutorial.tutorialId === "number"
	) {
		try {
			const tutorial = await db.query.tutorials.findFirst({
				where: eq(tutorials.id, session.tutorial.tutorialId),
			});

			return tutorial?.content
				? tutorial.content
				: {
						content:
							"No tutorial content found for the user. Please check the tutorial section.",
					};
		} catch (e) {
			console.error(e);
			return {
				content: "Failed to fetch tutorial content due to a server error.",
			};
		}
	}
	return {
		content:
			"No tutorial content found for the user. Please check the tutorial section.",
	};
}

export async function invokeLLM(
	session: SessionValue,
	availableBlocks: string[],
	socket: Socket,
) {
	const config = getConfig();

	const allBlocks = listAllBlocks(availableBlocks);

	if (!session.dialogue) {
		console.error("No dialogue found in the session.");
		return null;
	}

	const lastDialogue = session.dialogue[session.dialogue.length - 1];

	function isAudioMessageFromUser() {
		if (lastDialogue.contentType === "user_audio") {
			return true;
		}
		return false;
	}

	const isUserSentAudio = isAudioMessageFromUser();

	// From here, the process is branched (refactored)
	if (isUserSentAudio && session.userAudio) {
		const userAudio = session.userAudio.split(",")[1]; // It is in webm format.

		const webmBuffer = Buffer.from(userAudio, "base64");
		const webmInputPath = `/tmp/${Date.now()}.webm`;
		fs.writeFileSync(webmInputPath, webmBuffer);

		try {
			const mp3Path = await convertWebMToMp3(webmInputPath);

			updateAudioDialogue(session.sessionId, lastDialogue.id, socket, mp3Path);
			// KNOWLEDGE NOT AVAILABLE

			const tutorialContent = await getTutorialContent(session);

			const userTemplate = fillPrompt(dialogueUserTemplate, {
				dialogueHistory: JSON.stringify(await simplifyDialogue(session, 50)),
				tutorialContent: JSON.stringify(tutorialContent),
				knowledge: stringifyKnowledge(""),
				lastMessage: "The user sent an audio message.",
				easyMode: String(session.easyMode),
				workspace: JSON.stringify(session.workspace),
			});

			const audioUserTemplate = fillPrompt(audioDialogueUserTemplate, {
				dialogueHistory: JSON.stringify(await simplifyDialogue(session, 50)),
				tutorialContent: JSON.stringify(tutorialContent),
				knowledge: stringifyKnowledge(""),
				lastMessage: "The user sent an audio message.",
				easyMode: String(session.easyMode),
				workspace: JSON.stringify(session.workspace),
			});

			async function textFromAudio() {
				// Generate text from audio (no audio output)
				// Beta version of SDK is required to support structured output

				try {
					const result = await generateObject({
						model: openai("gpt-4o-audio-preview"),
						schema: zodTextSchema,
						messages: [
							{
								role: "system",
								content: fillPrompt(dialogueSystemTemplate, {
									language: langToStr(session.language || "en") || "en",
									allBlocks: availableBlocks.toString(),
									uiElements: ui
										.map((u) => `${u.ui} - ${u.description} ${u.warn}`)
										.join("\n"),
								}),
							},
							{
								role: "user",
								content: [
									// Input both DIALOGUE and AUDIO
									{ type: "text", text: userTemplate },
									{
										type: "file",
										mimeType: "audio/mpeg",
										data: fs.readFileSync(mp3Path).toString("base64"),
									},
								],
							},
						],
					});
					const response = result.object;
					return response;
				} catch (e) {
					if (NoObjectGeneratedError.isInstance(e)) {
						console.error("NoObjectGeneratedError");
						console.error("Cause:", e.cause);
						console.error("Text:", e.text);
						console.error("Response:", e.response);
						console.error("Usage:", e.usage);
					}
					return null;
				}
			}
			async function audioFromAudio() {
				// Generate audio as output directly from voice using AI voice mode.

				const completion = await openaiFromOpenAI.chat.completions.create({
					model: "gpt-4o-audio-preview",
					modalities: ["text", "audio"],
					audio: { voice: "alloy", format: "mp3" },
					messages: [
						{
							role: "system",
							content: fillPrompt(audioDialogueSystemTemplate, {
								language: langToStr(session.language || "en") || "en",
							}),
						},
						{
							role: "user",
							content: [
								// Input both DIALOGUE and AUDIO
								{ type: "text", text: audioUserTemplate },
								{
									type: "input_audio",
									input_audio: {
										data: fs.readFileSync(mp3Path).toString("base64"),
										format: "mp3",
									},
								},
							],
						},
					],
				});
				const response = completion.choices[0].message.audio;
				return response;
			}

			function generateResponseFromAudioInput() {
				if (session.responseMode === "audio") {
					return audioFromAudio();
				}
				return textFromAudio();
			}

			const response = await generateResponseFromAudioInput();

			if (!response) {
				console.error("No response from the AI model.");
				return null;
			}

			return response;
		} catch (e) {
			console.error("Error during audio conversion or LLM invocation", e);
			return null;
		} finally {
			// Cleanup temp files
			fs.unlinkSync(webmInputPath);
		}
	}

	// Process text messages from here

	const lastMessage = lastDialogue.content.toString();
	const knowledge = (await getKnowledge(lastMessage)) as Guide[] | string;

	const tutorialContent = await getTutorialContent(session);

	const userTemplate = fillPrompt(dialogueUserTemplate, {
		dialogueHistory: JSON.stringify(await simplifyDialogue(session, 50)),
		tutorialContent: JSON.stringify(tutorialContent),
		knowledge: stringifyKnowledge(knowledge),
		lastMessage,
		easyMode: String(session.easyMode),
		workspace: JSON.stringify(session.workspace),
	});

	const audioUserTemplate = fillPrompt(audioDialogueUserTemplate, {
		dialogueHistory: JSON.stringify(await simplifyDialogue(session, 50)),
		tutorialContent: JSON.stringify(tutorialContent),
		knowledge: stringifyKnowledge(knowledge),
		lastMessage,
		easyMode: String(session.easyMode),
		workspace: JSON.stringify(session.workspace),
	});

	async function audioFromText() {
		// Generate output speech directly from text using AI voice mode

		// Generate audio with the regular version, as the audio model does not support the Beta version of the structured output.
		// ai SDK is unavailable for the audio model
		const completion = await openaiFromOpenAI.chat.completions.create({
			model: "gpt-4o-audio-preview",
			modalities: ["text", "audio"],
			audio: { voice: "alloy", format: "mp3" },
			messages: [
				{
					role: "system",
					content: fillPrompt(audioDialogueSystemTemplate, {
						language: langToStr(session.language || "en") || "en",
					}),
				},
				{ role: "user", content: audioUserTemplate },
			],
			// response_format: zodResponseFormat(zodAudioSchema, "response_schema"), //not available
		});

		// Returned according to zodAudioSchema
		const response = completion.choices[0].message.audio;
		// Generate type from zod
		return response;
	}

	async function textFromText() {
		// Generate text using normal text mode
		// Structure or output seems to require a beta SDK.

		try {
			const result = await generateObject({
				model: openai(config.AI_Settings.Chat_AI_Model, {
					structuredOutputs: true,
				}),
				schema: zodTextSchema,
				messages: [
					{
						role: "system",
						content: fillPrompt(dialogueSystemTemplate, {
							language: langToStr(session.language || "en") || "en",
							allBlocks: allBlocks.toString(),
							uiElements: ui
								.map((u) => `${u.ui} - ${u.description} ${u.warn}`)
								.join("\n"),
						}),
					},
					{ role: "user", content: userTemplate },
				],
				temperature: config.AI_Settings.Chat_AI_Temperature,
			});

			const response = result.object;
			return response;
		} catch (e) {
			if (NoObjectGeneratedError.isInstance(e)) {
				console.error("NoObjectGeneratedError");
				console.error("Cause:", e.cause);
				console.error("Text:", e.text);
				console.error("Response:", e.response);
				console.error("Usage:", e.usage);
			}
			return null;
		}
	}

	function generateResponse() {
		if (session.responseMode === "audio") {
			return audioFromText();
		}
		return textFromText();
	}

	const response = await generateResponse();

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
