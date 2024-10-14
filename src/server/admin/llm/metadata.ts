import OpenAI from "openai";
import { getConfig } from "../../getConfig.js";
import type { AppConfig } from "../../../type.js";
import { listAllBlocks } from "../../../utils/blockList.js";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import type { metadataNode } from "../../../client/components/TutorialEditor/nodes/nodetype.js";
import {
	getAvailableBlocks,
	getBlockFiles,
} from "../../session/registerBlocks.js";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_API_ENDPOINT || "https://api.openai.com/vi",
});

async function generateMetadata(content?: string) {
	const config: AppConfig = getConfig();

	const schema = z.object({
		title: z.string(),
		description: z.string(),
		keywords: z.string(),
	});

	const systemTemplate = `
    You are revisor of the tutorial content.
	Generate metadata from the tutorial content based on user's input.
	Use user's language to generate metadata.
	There are title, description, and tags in the metadata.
	Title is the title of the tutorial.
	Description is the brief description of the tutorial.
	Tags are the keywords that describe the tutorial.
	These metadata are used for search to provide tutorial, so please provide accurate and attractive metadata.
    `;
	const userTemplate = `
    This is the tutorial content that user has written:
    ${content || ""}
    If the content is not provided, please generate a random one to prevent the error.
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

export { generateMetadata };
