import { experimental_transcribe as transcribe } from "ai";
import { openai } from "@/libs/openai";
import "dotenv/config";
/**
 * Transcribes base64 encoded WAV audio to text using OpenAI Whisper
 * @param base64wav - Base64 encoded WAV audio data
 * @returns Transcribed text or null if transcription fails
 */
export async function transcribeAudio(
	base64wav: string,
): Promise<string | null> {
	try {
		if (!base64wav || typeof base64wav !== "string") {
			console.error("Invalid base64wav input:", typeof base64wav);
			return null;
		}

		const transcription = await transcribe({
			model: openai.transcription("whisper-1"),
			audio: base64wav,
		});
		return transcription.text;
	} catch (error) {
		if (error instanceof Error) {
			console.error("Error details:", error.message);
			return `Error from whisper: ${error.message}`;
		}
		return null;
	}
}
