import OpenAI from "openai";
import { z } from "zod";
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
import { listAllBlocks } from "./allBlocks.js";
import stringifyKnowledge from "../../../utils/stringifyKnowledge.js";

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
});

export async function invokeLLM(
	session: SessionValue,
	availableBlocks: string[],
) {
	console.log("invokeLLM");
	const config: AppConfig = await getConfig();

	const allBlocks = listAllBlocks(availableBlocks);

	const zodSchema = z.object({
		isQuestion: z
			.boolean()
			.describe(
				"true if the user asked a question, false if it is a statement or just comment of user",
			),
		response: z
			.string()
			.describe(
				"response for user. Do not include blockId, blockName, and any unreadable characters in this field.",
			),
		blockId: z
			.string()
			.optional()
			.describe(
				"block id from user's Blockly workspace if needed. Skip this response if not needed.",
			),
		blockName: z
			.string()
			.optional()
			.describe(
				"block name to being used for code. It is defined from Blockly Workspace, and can refer from tutorial. Skip this response if not needed.",
			),
		progress: z
			.number()
			.describe("progress of the tutorial shown by 10 to 100."),
		ui: z
			.string()
			.optional()
			.describe(
				"Provide UI elements for the user to take action. If the user does not think such an action is necessary, skip this response.",
			),
		quickReplies: z.array(z.string()).describe("quick replies for the user."),
	});

	const lastMessage =
		session.dialogue[session.dialogue.length - 1]?.content.toString();

	const knowledge = (await getKnowledge(lastMessage)) as Guide[] | string;

	const tutorialContent = await getTutorialContent(session);
	console.log(tutorialContent);

	const systemTemplate = generateSystemTemplate(
		knowledge,
		session,
		JSON.stringify(tutorialContent),
		allBlocks,
	);

	const userTemplate = await generateUserTemplate(session, lastMessage);

	const completion = await openai.chat.completions.create({
		messages: [
			{ role: "system", content: systemTemplate },
			{ role: "user", content: userTemplate },
		],
		model: config.AI_Settings.Chat_AI_Model,
		response_format: { type: "json_object" },
		temperature: config.AI_Settings.Chat_AI_Temperature,
	});

	const response = completion.choices[0].message.content;
	if (!response) {
		throw new Error("Failed to generate response from the AI model.");
	}
	const parsedContent = zodSchema.parse(JSON.parse(response));

	if (parsedContent.isQuestion) {
		//ユーザーからの質問である場合、その質問を別のAIがトレーニングデータとして生成する
		console.log("User asked a question. Generating training data for the AI.");
		generateTrainingData(
			lastMessage,
			{
				author: "AI",
				date: new Date().toISOString(),
				sessionCode: session.sessioncode,
			},
			stringifyKnowledge(knowledge),
		);
	}

	//振り仮名をparsedContentに適用
	parsedContent.response = await applyRuby(parsedContent.response);

	return parsedContent;
}
