import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { AppConfig, SessionValue } from "../../../type.js";
import { langToStr } from "../../../utils/langToStr.js";
import { db } from "../../db/index.js";
import { getConfig } from "../../getConfig.js";
import { type Guide, tutorials } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { applyRuby } from "../../../utils/japaneseWithRuby.js";
import generateTrainingData from "../../admin/training/data_gen.js";
import { getKnowledge } from "../../admin/training/guides.js";
import { generateUserTemplate } from "./userTemplate.js";
import { generateSystemTemplate } from "./systemTemplate.js";
import { zodSchema } from "./responseFormat.js";
import { listAllBlocks } from "../../../utils/blockList.js";

//debug
console.log("llm/index.ts: Loading llm app");

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
) {
	console.log("invokeLLM");
	const config: AppConfig = await getConfig();

	const allBlocks = listAllBlocks(availableBlocks);

	const schema = zodSchema;

	const lastMessage =
		session.dialogue[session.dialogue.length - 1]?.content.toString();

	const knowledge = (await getKnowledge(lastMessage)) as Guide[] | string;

	const tutorialContent = await getTutorialContent(session);
	console.log(tutorialContent);

	const systemTemplate = generateSystemTemplate(session, allBlocks);

	const userTemplate = await generateUserTemplate(
		session,
		JSON.stringify(tutorialContent),
		knowledge,
		lastMessage,
	);

	const completion = await openai.beta.chat.completions.parse({
		messages: [
			{ role: "system", content: systemTemplate },
			{ role: "user", content: userTemplate },
		],
		model: config.AI_Settings.Chat_AI_Model,
		response_format: zodResponseFormat(schema, "response_schema"),
		temperature: config.AI_Settings.Chat_AI_Temperature,
	});

	const response = completion.choices[0].message.parsed;

	if (!response) {
		console.error("No response from the AI model.");
		return null;
	}

	if (response.isQuestion && response.formattedUserQuestion) {
		//ユーザーからの質問である場合、その質問を別のAIがトレーニングデータとして生成する
		console.log("User asked a question. Generating training data for the AI.");
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

	return response;
}
