import { experimental_transcribe as transcribe } from "ai";
import { openai } from "@/libs/openai";
import "dotenv/config";
/**
 * @description transcribe base64 wav to text
 * @param base64wav
 * @returns transcribed text or null if error
 */
export async function transcribeAudio(base64wav: string) {
	try {
		const transcription = await transcribe({
			model: openai.transcription("whisper-1"),
			audio: base64wav,
		});
		return transcription.text;
	} catch (error) {
		console.error("Error transcribing audio:", error);
		return null;
	}
}
