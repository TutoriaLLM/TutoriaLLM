import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

import type { AppConfig, SessionValue, Tutorial } from "../../../type.js";

import { langToStr } from "../../../utils/langToStr.js";
import { db } from "../../db/index.js";
import { getConfig } from "../../getConfig.js";

//sessionvalueを元に、会話を呼び出す。結果はdialogueに追加される
export async function invokeLLM(session: SessionValue) {
	//設定されている場合はチュートリアル内容を取得
	async function getTutorialContent() {
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
				if (tutorial) {
					console.log("tutorial", tutorial);
					return tutorial;
				}
				return {
					content:
						"no tutorial content found for user. encourage user to check out the tutorial section.",
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
				"no tutorial content found for user. encourage user to check out the tutorial section.",
		};
	}

	//dialogueを簡略化する
	async function simplifyDialogue() {
		const simplifiedDialogue = session.dialogue.map((d) => {
			return {
				role: d.contentType,
				content: d.content,
			};
		});
		return simplifiedDialogue;
	}

	console.log("invokeLLM");
	const config: AppConfig = await getConfig();
	const model = new ChatOpenAI({
		apiKey: process.env.VITE_OPENAI_API_KEY,
		model: config.AI_Settings.AI_Model,
		temperature: config.AI_Settings.AI_Temperature,
	});
	const systemTemplate = `
	You are a coding tutor, and you must use this language: {language}.
	You are required to provide both support and instruction to the user.
	If a tutorial is selected, use it to offer appropriate guidance.
	Explicitly instruct the user on what to do next based on the provided tutorial content and advance the session accordingly.
	Tutorial content: {tutorialContent}
	`;

	const userTemplate = `
    Answer the user's latest question based on past messages if they exist: {text}

    This is the past record of messages including user chat, server log, and AI responses: {dialogue}
    If there is no question, provide feedback based on past messages, or explain what is happening on the server.
    Use the provided tutorial content to guide the user explicitly on what they should do next.

	This is the workspace of Blockly; it will be converted to code to execute: {workspace}
	If there is no workspace, encourage the user to start coding and provide a message to help them begin.
    `;

	const promptTemplate = ChatPromptTemplate.fromMessages([
		["system", systemTemplate],
		["user", userTemplate],
	]);

	const parser = new StringOutputParser();

	const chain = promptTemplate.pipe(model).pipe(parser);

	const response = await chain.invoke({
		language: langToStr(session.language),
		tutorialContent: JSON.stringify(await getTutorialContent()),
		dialogue: JSON.stringify(await simplifyDialogue()),
		text: session.dialogue[session.dialogue.length - 1]?.content || "",
		workspace: JSON.stringify(session.workspace),
	});

	return response;
}
