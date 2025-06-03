import OpenAI from "openai";

// OpenAI API client to support audio modality(temporary)
const openaiFromOpenAI = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_API_ENDPOINT || "https://api.openai.com/v1",
});
/**
 * Generate audio from text
 * @param systemPrompt
 * @param userPrompt
 * @returns
 */
export async function textToAudio(systemPrompt: string, userPrompt: string) {
	// Generate output speech directly from text using AI voice mode

	// Generate audio with the regular version, as the audio model does not support the Beta version of the structured output.
	// ai SDK is unavailable for the audio model
	const completion = await openaiFromOpenAI.chat.completions.create({
		model: "gpt-4o-audio-preview",
		modalities: ["text", "audio"],
		audio: { voice: "alloy", format: "mp3" },
		messages: [
			{
				role: "system",
				content: systemPrompt,
			},
			{ role: "user", content: userPrompt },
		],
		// response_format: zodResponseFormat(zodAudioSchema, "response_schema"), //not available
	});

	// Returned according to zodAudioSchema
	const response = completion.choices[0].message.audio;
	// Generate type from zod
	return response;
}
