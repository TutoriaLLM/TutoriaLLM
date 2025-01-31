import { openai } from "@/libs/openai";
import { getBlockNames } from "@/libs/registerBlocks";
import { getConfig } from "@/modules/admin/config";
import {
	tutorialGenSystemTemplate,
	TutorialGenUserTemplate,
} from "@/prompts/tutorialGen";
import { listAllBlocks } from "@/utils/blockList";
import { fillPrompt } from "@/utils/prompts";
import { z } from "@hono/zod-openapi";
import { generateObject, NoObjectGeneratedError } from "ai";

async function generateContentFromContent(content?: string) {
	const config = getConfig();
	const blockName = await getBlockNames();

	const allBlocks = listAllBlocks(blockName);
	const schema = z.object({
		content: z.string(),
	});

	try {
		const result = await generateObject({
			model: openai(config.AI_Settings.Chat_AI_Model, {
				structuredOutputs: true,
			}),
			schema: schema,
			messages: [
				{
					role: "system",
					content: fillPrompt(tutorialGenSystemTemplate, {
						allBlocks: allBlocks.toString(),
					}),
				},
				{
					role: "user",
					content: fillPrompt(TutorialGenUserTemplate, {
						content: content || "Please generate a random tutorial content",
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

export { generateContentFromContent };
