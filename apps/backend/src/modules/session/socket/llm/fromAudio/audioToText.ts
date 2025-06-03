import { openai } from "@/libs/openai";
import { generateObject, NoObjectGeneratedError } from "ai";
import { zodTextSchema } from "../responseFormat";

/**
 * Generate text from audio (no audio output)
 * structured output is not supported for audio-preview model
 * @param base64Wav
 * @param systemPrompt
 * @param userPrompt
 * @param ui
 */
export async function audioToText(
	base64Wav: string,
	systemPrompt: string,
	userPrompt: string,
) {
	try {
		const result = await generateObject({
			model: openai("gpt-4o-mini-audio-preview"),
			schema: zodTextSchema,
			messages: [
				{
					role: "system",
					content: systemPrompt,
				},
				{
					role: "user",
					content: [
						// Input both DIALOGUE and AUDIO
						{ type: "text", text: userPrompt },
						{
							type: "file",
							mimeType: "audio/wav",
							data: base64Wav,
						},
					],
				},
			],
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
