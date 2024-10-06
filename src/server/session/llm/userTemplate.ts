import type { SessionValue } from "../../../type.js";
import stringifyKnowledge from "../../../utils/stringifyKnowledge.js";
import type { Guide } from "../../db/schema.js";

// Simplifies the dialogue by mapping the session dialogue to a simpler format.
async function simplifyDialogue(session: SessionValue) {
	return session.dialogue.map((d) => ({
		role: d.contentType,
		content: d.content,
	}));
}

async function generateUserTemplate(
	session: SessionValue,
	tutorialContent: string,
	knowledge: Guide[] | string,
	lastMessage: string,
): Promise<string> {
	return `
This is the past record of messages including user chat, server log, error, and AI responses: ${JSON.stringify(await simplifyDialogue(session))}
Use the provided tutorial content to guide the user explicitly on what they should do next, step by step(Do not provide the entire tutorial content at once).

Selected tutorial content: ${tutorialContent}

This is the knowledge base for the user: ${stringifyKnowledge(knowledge)}

Answer the user's latest question based on past messages if they are asking: ${lastMessage}

If the value of easy mode is true, provide a message to the user to help them understand the issue with using simple language. Use only simple vocabulary for all kanji.
Easy mode: ${session.easyMode}

This is the current user workspace of Blockly; it is rendered as blocks on the user's screen and will be converted to code to execute: ${JSON.stringify(session.workspace)}
To ask user to bring the block to workspace, provide the block name within the response.
To identify the block within workspace, write the block ID within the response from this workspace, instead of the block name.
If there is no workspace, encourage the user to start coding and provide a message to help them begin.
  `;
}

export { generateUserTemplate };
