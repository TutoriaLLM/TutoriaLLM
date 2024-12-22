import { db } from "@/db";
import { tags } from "@/db/schema";
import { openai } from "@/libs/openai";
import { getConfig } from "@/modules/admin/config";
import {
	metadataGenSystemTemplate,
	metadataGenUserTemplate,
} from "@/prompts/metadataGen";
import { fillPrompt } from "@/utils/prompts";
import { z } from "@hono/zod-openapi";
import { generateObject, NoObjectGeneratedError } from "ai";

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

	try {
		const result = await generateObject({
			model: openai(config.AI_Settings.Chat_AI_Model, {
				structuredOutputs: true,
			}),
			schema: schema,
			messages: [
				{
					role: "system",
					content: fillPrompt(metadataGenSystemTemplate, {
						existingTags: existingTags,
						languages: languages.join(", "),
					}),
				},
				{
					role: "user",
					content: fillPrompt(metadataGenUserTemplate, {
						content:
							content || "Please generate random metadata to avoid errors.",
					}),
				},
			],
			temperature: config.AI_Settings.Chat_AI_Temperature,
		});

		const response = result.object;

		return response;
	} catch (e) {
		if (NoObjectGeneratedError.isInstance(e)) {
			console.error("NoObjectGeneratedError");
			console.error("Cause:", e.cause);
			console.error("Text:", e.text);
			console.error("Response:", e.response);
			console.error("Usage:", e.usage);
		}
		return null;
	}
}

export { generateMetadataFromContent };
