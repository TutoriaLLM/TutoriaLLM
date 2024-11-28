import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { eq, is } from "drizzle-orm";
import {
	generateAudioUserTemplate,
	generateUserTemplate,
} from "@/modules/session/socket/llm/userTemplate";
import {
	generateAudioSystemTemplate,
	generateSystemTemplate,
	generateSystemTemplateFor4oPreview,
} from "@/modules/session/socket/llm/systemTemplate";
import {
	zodAudioSchema,
	zodTextSchema,
} from "@/modules/session/socket/llm/responseFormat";
import ffmpeg from "fluent-ffmpeg";
import fs from "node:fs";
import type { Socket } from "socket.io";
import { updateAudioDialogue } from "@/modules/session/socket/llm/whisper";
import type { SessionValue } from "@/modules/session/schema";
import { getConfig } from "@/modules/config";
import { listAllBlocks } from "@/utils/blockList";
import { getKnowledge } from "@/modules/admin/training/utils/knowledge";
import { tutorials, type Guide } from "@/db/schema";
import generateTrainingData from "@/utils/generateTrainingData";
import { applyRuby } from "@/utils/japaneseWithRuby";
import { db } from "@/db";

//debug
console.log("llm/index.ts: Loading llm app");

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
	console.log("invokeLLM");
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

	//ここから処理を分岐(リファクタリングする）
	if (isUserSentAudio && session.userAudio) {
		const userAudio = session.userAudio.split(",")[1]; //webm形式になっている

		const webmBuffer = Buffer.from(userAudio, "base64");
		const webmInputPath = `/tmp/${Date.now()}.webm`;
		fs.writeFileSync(webmInputPath, webmBuffer);

		try {
			const mp3Path = await convertWebMToMp3(webmInputPath);

			console.log("userAudio", mp3Path);
			updateAudioDialogue(
				session.sessioncode,
				lastDialogue.id,
				socket,
				mp3Path,
			);
			//knowledgeは利用不可

			const tutorialContent = await getTutorialContent(session);

			const audioSystemTemplate = generateAudioSystemTemplate(session);
			const gpt4oAudioPreviewTemplate = generateSystemTemplateFor4oPreview(
				//4o audio previewは構図化出力をサポートしていないため、別のプロンプトを使用する
				session,
				allBlocks,
			);

			const userTemplate = await generateUserTemplate(
				session,
				JSON.stringify(tutorialContent),
				"",
				"The user sent an audio message.",
			);

			const audioUserTemplate = await generateAudioUserTemplate(
				session,
				JSON.stringify(tutorialContent),
				"",
				"The user sent an audio message.",
			);

			async function textFromAudio() {
				//audioからテキストを生成する（音声出力はなし）
				//構造化出力に対応させるためにはBeta版のSDKが必要
				console.log("textFromAudio");

				const completion = await openai.chat.completions.create({
					model: "gpt-4o-audio-preview",
					modalities: ["text"],
					messages: [
						{ role: "system", content: gpt4oAudioPreviewTemplate },
						{
							role: "user",
							content: [
								//Dialogueとaudioを両方入力する
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
					// response_format: zodResponseFormat(zodTextSchema, "response_schema"), //利用できない
				});

				//zodで検証し、返答が間違っている場合はその部分を空の文字列にする
				let response = completion.choices[0].message.content;
				try {
					if (response) {
						response = JSON.parse(response);
					}
				} catch (e) {
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
				//AIによる音声モードを利用して音声から出力となる音声を直接生成する
				console.log("audioFromAudio");

				const completion = await openai.chat.completions.create({
					model: "gpt-4o-audio-preview",
					modalities: ["text", "audio"],
					audio: { voice: "alloy", format: "mp3" },
					messages: [
						{ role: "system", content: audioSystemTemplate },
						{
							role: "user",
							content: [
								//Dialogueとaudioを両方入力する
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
					// response_format: zodResponseFormat(zodAudioSchema, "response_schema"), //利用できない
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

	//ここからテキストメッセージの処理

	const lastMessage = lastDialogue.content.toString();
	const knowledge = (await getKnowledge(lastMessage)) as Guide[] | string;

	const tutorialContent = await getTutorialContent(session);

	const systemTemplate = generateSystemTemplate(session, allBlocks);
	const audioSystemTemplate = generateAudioSystemTemplate(session);

	const userTemplate = await generateUserTemplate(
		session,
		JSON.stringify(tutorialContent),
		knowledge,
		lastMessage,
	);

	const audioUserTemplate = await generateAudioUserTemplate(
		session,
		JSON.stringify(tutorialContent),
		knowledge,
		lastMessage,
	);
	async function audioFromText() {
		//AIによる音声モードを利用してテキストから出力となる音声を直接生成する
		console.log("audioFromText");

		//オーディオモデルでBeta版の構造化出力は対応していないので、通常のバージョンでオーディオを生成する
		const completion = await openai.chat.completions.create({
			model: "gpt-4o-audio-preview",
			modalities: ["text", "audio"],
			audio: { voice: "alloy", format: "mp3" },
			messages: [
				{ role: "system", content: audioSystemTemplate },
				{ role: "user", content: audioUserTemplate },
			],
			// response_format: zodResponseFormat(zodAudioSchema, "response_schema"), //利用できない
		});

		//zodAudioSchemaに合わせて返却する
		const response = completion.choices[0].message.audio;
		console.log(response);
		//zodから型を生成する
		return response;
	}

	async function textFromText() {
		//通常のテキストモードを利用してテキストを生成する
		//構造か出力はbetaのSDKが必要っぽい
		console.log("textFromText");
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
			//ユーザーからの質問である場合、その質問を別のAIがトレーニングデータとして生成する
			console.log(
				"User asked a question. Generating training data for the AI.",
			);
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

		console.log("Response from the AI model: ", response);

		//振り仮名をparsedContentに適用
		response.response = await applyRuby(response.response);
	}

	return response;
}
