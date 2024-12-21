import type { SessionValue } from "@/modules/session/schema";

// Simplifies the dialogue by mapping the session dialogue to a simpler format.
export async function simplifyDialogue(session: SessionValue, limit: number) {
	const dialogue = session.dialogue?.map((d) => ({
		role: d.contentType,
		content: d.content,
	}));
	return limit > 0 ? dialogue?.slice(-limit) : dialogue;
}

/**
 * Template for generating guidance prompts
 * @template Variables that can be replaced:
 * - {{dialogueHistory}} - Past record of messages including user chat, server log, error, and AI responses
 * - {{tutorialContent}} - Selected tutorial content to guide the user
 * - {{knowledge}} - Knowledge base for the user
 * - {{lastMessage}} - User's latest question
 * - {{easyMode}} - Boolean flag for using simple language
 * - {{workspace}} - Current user workspace of Blockly
 * @example
 * const prompt = fillPrompt(guidanceTemplate, {
 *   dialogueHistory: JSON.stringify(dialogueHistory),
 *   tutorialContent: "Tutorial steps...",
 *   knowledge: "Knowledge base...",
 *   lastMessage: "User question",
 *   easyMode: "true",
 *   workspace: "{}"
 * });
 */
export const guidanceTemplate = `
This is the past record of messages including user chat, server log, error, and AI responses: {{dialogueHistory}}
Use the provided tutorial content to guide the user explicitly on what they should do next, step by step(Do not provide the entire tutorial content at once).

Selected tutorial content: {{tutorialContent}}

This is the knowledge base for the user: {{knowledge}}

Answer the user's latest question based on past messages if they are asking: {{lastMessage}}

If the value of easy mode is true, provide a message to the user to help them understand the issue with using simple language. Use only simple vocabulary for all kanji.
Easy mode: {{easyMode}}

This is the current user workspace of Blockly; it is rendered as blocks on the user's screen and will be converted to code to execute: {{workspace}}
To ask user to bring the block to workspace, provide the block name within the response.
To identify the block within workspace, write the block ID within the response from this workspace, instead of the block name.
If there is no workspace, encourage the user to start coding and provide a message to help them begin.
` as const;

/**
 * Template for generating audio guidance prompts
 * @template Variables that can be replaced:
 * - {{dialogueHistory}} - Past record of messages including user chat, server log, error, and AI responses
 * - {{tutorialContent}} - Selected tutorial content for audio guidance
 * - {{knowledge}} - Knowledge base for the user
 * - {{lastMessage}} - User's latest question
 * - {{easyMode}} - Boolean flag for using simple language with explanations
 * - {{workspace}} - Current user workspace (for reference only, no technical details in response)
 * @remarks
 * This template is specifically designed for audio responses:
 * - Uses simpler vocabulary
 * - Avoids technical references like block IDs
 * - Provides explanations for difficult terms
 */
export const audioGuidanceTemplate = `
This is the past record of messages including user chat, server log, error, and AI responses: {{dialogueHistory}}
Use the provided tutorial content to guide the user explicitly on what they should do next, step by step(Do not provide the entire tutorial content at once) with audio format.

Selected tutorial content: {{tutorialContent}}

This is the knowledge base for the user: {{knowledge}}

Answer the user's latest question based on past messages if they are asking: {{lastMessage}}

If the value of easy mode is true, provide a message to the user to help them understand the issue with using simple language. Use only SIMPLE vocabulary. if there is word that is difficult to understand, provide a explanation in simple language.
Easy mode: {{easyMode}}

This is the current user workspace of Blockly; it is rendered as blocks on the user's screen and will be converted to code to execute: {{workspace}}
The workspace is just for a reference, so do not provide block ID or block name, or any information that is not able to be understood by audio.
If there is no workspace, encourage the user to start coding and provide a message to help them begin.
` as const;
