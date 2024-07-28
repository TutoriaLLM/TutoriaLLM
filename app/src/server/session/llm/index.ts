import OpenAI from "openai";
import { z } from "zod";
import type { AppConfig, SessionValue } from "../../../type.js";
import { langToStr } from "../../../utils/langToStr.js";
import { db } from "../../db/index.js";
import { getConfig } from "../../getConfig.js";
import { tutorials } from "../../db/schema.js";
import { eq } from "drizzle-orm";

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
			return tutorial
				? tutorial
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

export async function invokeLLM(session: SessionValue) {
	console.log("invokeLLM");
	const config: AppConfig = await getConfig();

	const zodSchema = z.object({
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
	});

	const systemTemplate = `
You are a coding tutor using the following language: ${langToStr(session.language)}
You are required to provide both teaching and instruction to the user based on the tutorial document.
If a tutorial document is provided, teach and instruct the user with appropriate methods. If it is not chosen, encourage the user to select a tutorial, or start creating their own code.
User will be using Blockly to create code, and you will be guiding them through the process. The created code will be executed on the server by converting the blocks to JavaScript code.
Explicitly instruct the user on what to do next, based on the provided tutorial content and advance the session accordingly.
Response must be in JSON format with the following structure. BlockId and BlockName arr used on system and response is the message to the user.:
{
  "response": "string",
  "blockId": "string (optional)",
  "blockName": "string (optional)",
  "progress": number (10 to 100)
}

Tutorial content: ${JSON.stringify(await getTutorialContent(session))}

Format Instructions: The response must be in JSON format.
  `;

	const userTemplate = `
This is the past record of messages including user chat, server log, and AI responses: ${JSON.stringify(await simplifyDialogue(session))}
If there is no question, provide feedback based on past messages, or explain what is happening on the server.
Use the provided tutorial content to guide the user explicitly on what they should do next.

Answer the user's latest question based on past messages if they are asking: ${session.dialogue[session.dialogue.length - 1]?.content}

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

	return parsedContent;
}
