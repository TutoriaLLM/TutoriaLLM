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

// Simplifies the dialogue by mapping the session dialogue to a simpler format.
async function simplifyDialogue(session: SessionValue) {
	return session.dialogue.map((d) => ({
		role: d.contentType,
		content: d.content,
	}));
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

	const basicBlocks = [
		"controls_repeat_ext",
		"controls_whileUntil",
		"controls_for",
		"controls_forEach",
		"controls_flow_statements",
		"controls_if",
		"logic_compare",
		"logic_operation",
		"logic_negate",
		"logic_boolean",
		"logic_null",
		"logic_ternary",
		"math_number",
		"math_arithmetic",
		//"math_single",
		//"math_trig",
		//"math_constant",
		"math_number_property",
		"math_round",
		"math_on_list",
		"math_modulo",
		"math_constrain",
		"math_random_int",
		"math_random_float",
		//"math_atan2",
		"text",
		"text_join",
		"text_append",
		"text_length",
		"text_isEmpty",
		"text_indexOf",
		"text_charAt",
		"text_getSubstring",
		"text_changeCase",
		"text_trim",
		"text_count",
		"text_replace",
		"text_reverse",
		//"text_print",
		"lists_create_empty",
		"lists_create_with",
		"lists_repeat",
		"lists_length",
		"lists_isEmpty",
		"lists_indexOf",
		"lists_getIndex",
		"lists_setIndex",
	];

	const allBlocks = basicBlocks.concat(availableBlocks);
	console.log(allBlocks);

	const zodSchema = z.object({
		isQuestion: z
			.boolean()
			.describe(
				"true if the user asked a question, false if it is a statement or just comment of user",
			),
		response: z.string().describe("response for dialogue."),
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
		quickReplies: z.array(z.string()).describe("quick replies for the user."),
	});

	const lastMessage =
		session.dialogue[session.dialogue.length - 1]?.content.toString();

	const knowledge = (await getKnowledge(lastMessage)) as Guide[] | string;
	function stringifyKnowledge(knowledge: Guide[] | string) {
		if (typeof knowledge === "string") {
			return knowledge;
		}
		try {
			return JSON.stringify((knowledge as Guide[]).map((k) => k.answer));
		} catch (e) {
			console.error(e);
			return "Failed to stringify knowledge.";
		}
	}

	const systemTemplate = `
You are a coding tutor using the following language: ${langToStr(session.language)}
Provide both teaching and instruction to the user based on the tutorial document and knowledge: ${stringifyKnowledge(knowledge)}
If a tutorial document is provided, teach and instruct the user with using simple language. If it is not chosen, encourage the user to select a tutorial, or start creating their own code.
User will be using Blockly workspace to create code, and can be executed to see the result with pressing the run button.
Response must be in JSON format with the following structure. Do not respond BlockId and BlockName on response fields, and use blockId or BlockName field instead as system will display these block automatically.:
{
  "isQuestion": boolean, // true if the user asked a question, false if it is a statement or just comment of user
  "response": "string", // response for dialogue. do not include blockId and blockName in this field.
  "blockId": "string (optional)", // optional field to specify the blocks on the workspace
  "blockName": "string (optional)", // optional field to specify the block name to be used for code
  "progress": number (10 to 100), // progress of the tutorial shown by 10 to 100
  "quickReplies": string[] (provide least 3 to maximum 5 quick replies for the user to choose from) // quick replies for the user. Provide easy to understand options, such as "yes" ,"no", "I don't know", or "What do I need to do?". do not include blockId and blockName in this field.
}

Tutorial content: ${JSON.stringify(await getTutorialContent(session))}
Also, these are the blocks that are available for this session. Do not use BlockID and BlockName that are not listed here: ${JSON.stringify(allBlocks)}
  `;

	const userTemplate = `
This is the past record of messages including user chat, server log, error, and AI responses: ${JSON.stringify(await simplifyDialogue(session))}
If there is any error, provide a message to the user to help them understand the issue.
If there is no question, provide feedback based on past messages, or explain what is happening on the server.
Use the provided tutorial content to guide the user explicitly on what they should do next.

Answer the user's latest question based on past messages if they are asking: ${lastMessage}

If the value of easy mode is true, provide a message to the user to help them understand the issue with using simple language. For Japanese, use only Hiragana and Katakana Instead of Kanji.
Easy mode: ${session.easyMode}

This is the current user workspace of Blockly; it is rendered as blocks on the user's screen and will be converted to code to execute: ${JSON.stringify(session.workspace)}
You may attach blockId from the workspace that you are referring to.
Also, you may attach blockName to display the block that is needed to proceed with the next steps.
If there is no workspace, encourage the user to start coding and provide a message to help them begin.
  `;

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
