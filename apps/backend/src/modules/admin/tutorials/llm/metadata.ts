import OpenAI from "openai";
import { listAllBlocks } from "../../../../utils/blockList.js";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { getConfig } from "../../config/index.js";
import { db } from "../../../../db/index.js";
import { tags } from "../../../../db/schema.js";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_API_ENDPOINT || "https://api.openai.com/vi",
});

async function generateMetadataFromContent(content?: string) {
	const config = getConfig();

	const schema = z.object({
		title: z.string(),
		description: z.string(),
		tags: z.array(z.string()),
		language: z.string(),
	});

	const languages = [
		"en",
		"ja",
		"zh",
		"ms",
		"id",
		"ko",
		"es",
		"fr",
		"de",
		"it",
		"nl",
		"pl",
		"pt",
		"ru",
		"tr",
		"vi",
		"th",
		"fa",
		"hi",
		"bn",
		"ta",
		"te",
	];

	async function getExistingTags() {
		try {
			const allTags = await db.select().from(tags);
			return allTags.map((tag) => tag.name).join(", ");
		} catch (error) {
			console.error("Error fetching tags:", error);
			return "";
		}
	}

	const existingTags = await getExistingTags();

	const systemTemplate = `
    You are revisor of the tutorial content.
	Generate metadata from the tutorial content based on user's input.
	Use user's language to generate metadata.
	There are title, description, and tags in the metadata.
	Title is the title of the tutorial.
	Description is the brief description of the tutorial.
	Tags are the tags that describe the tutorial.
	These metadata are used for search to provide tutorial, so please provide accurate and attractive metadata. For tags, use 3 to 5 tags that describe the tutorial.
	These are existing tags can be used: ${existingTags}.
	If there are no existing tags that is suitable, please generate new tags.
	
	The language of the tutorial is based on the input of the user. If the language is not provided, use en.
	These languages are available: ${languages.join(", ")}.
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

export { generateMetadataFromContent };
