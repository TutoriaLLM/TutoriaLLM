import { openai } from "@/libs/openai";
import { generateObject, NoObjectGeneratedError } from "ai";
import { zodTextSchema } from "../responseFormat";

/**
 * Generate structured text from text
 * @param model
 * @param temperature
 * @param systemPrompt
 * @param userPrompt
 * @returns
 */
export async function textFromText(
	model: string,
	temperature: number,
	systemPrompt: string,
	userPrompt: string,
) {
	// Generate text using normal text mode
	// Structure or output seems to require a beta SDK.

	try {
		const result = await generateObject({
			model: openai(model, {
				structuredOutputs: true,
			}),
			schema: zodTextSchema,
			messages: [
				{
					role: "system",
					content: systemPrompt,
				},
				{ role: "user", content: userPrompt },
			],
			temperature: temperature,
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
