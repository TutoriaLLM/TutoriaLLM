import OpenAI from "openai";
import { listAllBlocks } from "@/utils/blockList";
import { z } from "@hono/zod-openapi";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { getConfig } from "@/modules/admin/config";
import { getBlockNames } from "@/libs/registerBlocks";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_API_ENDPOINT || "https://api.openai.com/vi",
});

async function generateContentFromContent(content?: string) {
	const config = getConfig();
	const blockname = await getBlockNames();

	const allBlocks = listAllBlocks(blockname);
	const schema = z.object({
		content: z.string(),
	});

	const systemTemplate = `
    You are revisor of the tutorial content.
    User is writing a tutorial content to be used for teaching programming tutorial.
    Use user's language to generate tutorial content.
    This tutorial content is designed to instruct AI to teach programming for beginners.
    The programming is based on the block-based programming language, Blockly.
    The tutorial should be contain instructions step by step.
    
    For available blocks, you can refer to the following list: ${allBlocks.join(", ")}.
    Do not include any blocks that are not in the list, and do not define any new blocks, information, or concepts that are not provided.

    Edit the user's tutorial content, or generate a new one if the tutorial content is not provided.
    The content should be written in Markdown format, and separated by chapters.
    `;
	const userTemplate = `
    This is the tutorial content that user has written:
    ${content || ""}
    You may refer any available blocks, and any information ONLY from here.
    If the content is not provided, please generate a random one.
    `;

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

	return response;
}

export { generateContentFromContent };
