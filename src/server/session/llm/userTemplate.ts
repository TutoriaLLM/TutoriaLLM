import type { SessionValue } from "../../../type.js";

// Simplifies the dialogue by mapping the session dialogue to a simpler format.
async function simplifyDialogue(session: SessionValue) {
	return session.dialogue.map((d) => ({
		role: d.contentType,
		content: d.content,
	}));
}

async function generateUserTemplate(
	session: SessionValue,
	lastMessage: string,
): Promise<string> {
	return `
This is the past record of messages including user chat, server log, error, and AI responses: ${JSON.stringify(await simplifyDialogue(session))}
If there is any error, provide a message to the user to help them understand the issue.
If there is no question, provide feedback based on past messages, or explain what is happening on the server.
Use the provided tutorial content to guide the user explicitly on what they should do next.

Answer the user's latest question based on past messages if they are asking: ${lastMessage}

If the value of easy mode is true, provide a message to the user to help them understand the issue with using simple language. Use only simple vocabulary and use ruby for all kanji.
Easy mode: ${session.easyMode}

This is the current user workspace of Blockly; it is rendered as blocks on the user's screen and will be converted to code to execute: ${JSON.stringify(session.workspace)}
You may attach blockId from the workspace that you are referring to.
Also, you may attach blockName to display the block that is needed to proceed with the next steps.
If there is no workspace, encourage the user to start coding and provide a message to help them begin.
  `;
}

export { generateUserTemplate };
