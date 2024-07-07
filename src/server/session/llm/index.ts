import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import type { AppConfig, SessionValue, Tutorial } from "../../../type.js";

import { langToStr } from "../../../utils/langToStr.js";
import { db } from "../../db/index.js";
import { getConfig } from "../../getConfig.js";

// Fetches the tutorial content based on the session value.
async function getTutorialContent(session: SessionValue) {
	if (
		session.tutorial.tutorialId &&
		typeof session.tutorial.tutorialId === "number"
	) {
		try {
			const tutorial = await db
				.selectFrom("tutorials")
				.select(["id", "metadata", "content"])
				.where("id", "=", session.tutorial.tutorialId)
				.executeTakeFirst();
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

export async function invokeLLM(session: SessionValue) {
	console.log("invokeLLM");
	const config: AppConfig = await getConfig();
	const model = new ChatOpenAI({
		apiKey: process.env.VITE_OPENAI_API_KEY,
		model: config.AI_Settings.Chat_AI_Model,
		temperature: config.AI_Settings.Chat_AI_Temperature,
	});

	const systemTemplate = `
You are a coding tutor with using following language: {language}.
You are required to provide both teaching and instruction to the user based on tutorial document.
If a tutorial document has provided, teach and instruct the user with appropriate methods. If its not choosed, encourage user to select tutorial, or start creating own code.
Explicitly instruct the user on what to do next, based on the provided tutorial content and advance the session accordingly.

Tutorial content: {tutorialContent}

Format Instructions: {format_instructions}
	`;

	const userTemplate = `
This is the past record of messages including user chat, server log, and AI responses: {dialogue}
If there is no question, provide feedback based on past messages, or explain what is happening on the server.
Use the provided tutorial content to guide the user explicitly on what they should do next.

Answer the user's latest question based on past messages if they asking: {text}

This is the current user workspace of Blockly; it has rendered as block in user's screen, and will be converted to code to execute: {workspace}
You may attach blockId from workspace that you are reffering.
If there is no workspace, encourage the user to start coding and provide a message to help them begin.
    `;

	const promptTemplate = ChatPromptTemplate.fromMessages([
		["system", systemTemplate],
		["user", userTemplate],
	]);

	const zodSchema = z.object({
		response: z.string().describe("response for dialogue."),
		blockId: z
			.string()
			.optional()
			.describe(
				"block id from user's Blockly workspace if needed. Skip this response if not needed.",
			),
		progress: z
			.number()
			.describe("progress of the tutorial that shown by 10 to 100."),
	});

	const parser = StructuredOutputParser.fromZodSchema(zodSchema);

	const chain = RunnableSequence.from([promptTemplate, model, parser]);

	const response = await chain.invoke({
		format_instructions: parser.getFormatInstructions(),
		language: langToStr(session.language),
		tutorialContent: JSON.stringify(await getTutorialContent(session)),
		dialogue: JSON.stringify(await simplifyDialogue(session)),
		text: session.dialogue[session.dialogue.length - 1]?.content || "",
		workspace: JSON.stringify(session.workspace),
	});

	return response;
}
