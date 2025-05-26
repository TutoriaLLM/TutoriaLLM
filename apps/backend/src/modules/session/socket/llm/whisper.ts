// Asynchronously transcribe received mp3s and save (deliver) them to Dialogue
import fs from "node:fs";
import { db } from "@/db";
import { appSessions } from "@/db/schema";
import { updateAndBroadcastDiffToAll } from "@/modules/session/socket/updateDB";
import { eq } from "drizzle-orm";
import { experimental_transcribe as transcribe } from "ai";
import { openai } from "@/libs/openai";
import type { Socket } from "socket.io";

/**
 * NEED FIX: 別ファイルの上では動くが、なぜかここで使うと動かない
 *
 */
async function audioToText(base64wav: string) {
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

export async function updateAudioDialogue(
	sessionId: string,
	target_id: number,
	Socket: Socket,
	audioPath: string, //expected as wav
) {
	const base64Audio = fs.readFileSync(audioPath).toString("base64");

	const transcript = await audioToText(base64Audio);

	// Migrated from Redis to Postgres: from 1.0.0
	const data = await db.query.appSessions.findFirst({
		where: eq(appSessions.sessionId, sessionId),
	});
	const newData = data
		? {
				// Overwrite AI text in dialog for a specific ID
				...data,
				dialogue: data.dialogue
					? [
							...data.dialogue.map((dialogue) => {
								if (
									dialogue.id === target_id &&
									dialogue.contentType === "user_audio"
								) {
									return {
										...dialogue,
										content: transcript || "error",
									};
								}
								return dialogue;
							}),
						]
					: [],
			}
		: null;

	if (!newData) {
		return;
	}

	await updateAndBroadcastDiffToAll(sessionId, newData, Socket);
}
