import OpenAI from "openai";

// OpenAI API client to support audio modality(temporary)
const openaiFromOpenAI = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_API_ENDPOINT || "https://api.openai.com/v1",
});

/**
 * Generate audio from audio (no text output)
 * Currently AI SDK does not support audio output, using OpenAI API instead(Requires API key from environment variable)
 * @param base64Wav
 * @param systemPrompt
 * @param userPrompt
 * @returns
 */
export async function audioToAudio(
	base64Wav: string,
	systemPrompt: string,
	userPrompt: string,
) {
	const completion = await openaiFromOpenAI.chat.completions.create({
		model: "gpt-4o-mini-audio-preview",
		modalities: ["text", "audio"],
		audio: { voice: "alloy", format: "mp3" },
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
						type: "input_audio",
						input_audio: {
							data: base64Wav,
							format: "wav",
						},
					},
				],
			},
		],
	});
	const response = completion.choices[0].message.audio;
	return response;
}
