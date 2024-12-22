import fs from "node:fs";
import { db } from "@/db";
import { type Guide, tutorials } from "@/db/schema";
import { getKnowledge } from "@/modules/admin/training/utils/knowledge";
import { getConfig } from "@/modules/config";
import type { SessionValue } from "@/modules/session/schema";
import { zodTextSchema } from "@/modules/session/socket/llm/responseFormat";
import {
	generateAudioSystemTemplate,
	generateSystemTemplate,
	generateSystemTemplateFor4oPreview,
} from "@/modules/session/socket/llm/systemTemplate";
import {
	audioGuidanceTemplate,
	guidanceTemplate,
	simplifyDialogue,
} from "@/prompts/guidance";
import { updateAudioDialogue } from "@/modules/session/socket/llm/whisper";
import { listAllBlocks } from "@/utils/blockList";
import generateTrainingData from "@/utils/generateTrainingData";
import { applyRuby } from "@/utils/japaneseWithRuby";
import { eq } from "drizzle-orm";
import ffmpeg from "fluent-ffmpeg";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { Socket } from "socket.io";
import { fillPrompt } from "@/utils/prompts";
import stringifyKnowledge from "@/utils/stringifyKnowledge";

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

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_API_ENDPOINT || "https://api.openai.com/vi",
});

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

			updateAudioDialogue(
				session.sessioncode,
				lastDialogue.id,
				socket,
				mp3Path,
			);
			// KNOWLEDGE NOT AVAILABLE

			const tutorialContent = await getTutorialContent(session);

			const audioSystemTemplate = generateAudioSystemTemplate(session);
			const gpt4oAudioPreviewTemplate = generateSystemTemplateFor4oPreview(
				// 4o audio preview does not support compositional output, use a different prompt
				session,
				allBlocks,
			);

			const userTemplate = fillPrompt(guidanceTemplate, {
				dialogueHistory: JSON.stringify(await simplifyDialogue(session, 50)),
				tutorialContent: JSON.stringify(tutorialContent),
				knowledge: stringifyKnowledge(""),
				lastMessage: "The user sent an audio message.",
				easyMode: String(session.easyMode),
				workspace: JSON.stringify(session.workspace),
			});

			const audioUserTemplate = fillPrompt(audioGuidanceTemplate, {
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

				const completion = await openai.chat.completions.create({
					model: "gpt-4o-audio-preview",
					modalities: ["text"],
					messages: [
						{ role: "system", content: gpt4oAudioPreviewTemplate },
						{
							role: "user",
							content: [
								// Input both DIALOGUE and AUDIO
								{ type: "text", text: userTemplate },
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
					// response_format: zodResponseFormat(zodTextSchema, "response_schema"), //not available
				});

				// Validate with zod and if the reply is wrong, make the part an empty string
				let response = completion.choices[0].message.content;
				try {
					if (response) {
						response = JSON.parse(response);
					}
				} catch {
					return response; // Return the raw response as a string
				}
				const parsedResponse = zodTextSchema.safeParse(response);
				if (!parsedResponse.success) {
					console.error("Response parsing failed:", parsedResponse.error);
					return response; // Return the raw response as a string
				}
				return parsedResponse.data;
			}
			async function audioFromAudio() {
				// Generate audio as output directly from voice using AI voice mode.

				const completion = await openai.chat.completions.create({
					model: "gpt-4o-audio-preview",
					modalities: ["text", "audio"],
					audio: { voice: "alloy", format: "mp3" },
					messages: [
						{ role: "system", content: audioSystemTemplate },
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
					// response_format: zodResponseFormat(zodAudioSchema, "response_schema"), //not available
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

	const systemTemplate = generateSystemTemplate(session, allBlocks);
	const audioSystemTemplate = generateAudioSystemTemplate(session);

	const userTemplate = fillPrompt(guidanceTemplate, {
		dialogueHistory: JSON.stringify(await simplifyDialogue(session, 50)),
		tutorialContent: JSON.stringify(tutorialContent),
		knowledge: stringifyKnowledge(knowledge),
		lastMessage,
		easyMode: String(session.easyMode),
		workspace: JSON.stringify(session.workspace),
	});

	const audioUserTemplate = fillPrompt(audioGuidanceTemplate, {
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
		const completion = await openai.chat.completions.create({
			model: "gpt-4o-audio-preview",
			modalities: ["text", "audio"],
			audio: { voice: "alloy", format: "mp3" },
			messages: [
				{ role: "system", content: audioSystemTemplate },
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
		const completion = await openai.beta.chat.completions.parse({
			messages: [
				{ role: "system", content: systemTemplate },
				{ role: "user", content: userTemplate },
			],
			model: config.AI_Settings.Chat_AI_Model,
			response_format: zodResponseFormat(zodTextSchema, "response_schema"),
			temperature: config.AI_Settings.Chat_AI_Temperature,
		});

		const response = completion.choices[0].message.parsed;
		return response;
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
					sessionCode: session.sessioncode,
				},
				response.response,
			);
		}
		// Apply furigana to parsedContent
		response.response = await applyRuby(response.response);
	}

	return response;
}
