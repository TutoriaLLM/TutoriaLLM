// Asynchronously transcribe received mp3s and save (deliver) them to Dialogue

import fs from "node:fs";
import { db } from "@/db";
import { appSessions } from "@/db/schema";
import { updateAndBroadcastDiffToAll } from "@/modules/session/socket/updateDB";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import type { Socket } from "socket.io";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_API_ENDPOINT || "https://api.openai.com/vi",
});

async function audioToText(mp3Path: string) {
	const transcription = await openai.audio.transcriptions.create({
		file: fs.createReadStream(mp3Path),
		model: "whisper-1",
		response_format: "text",
	});
	return transcription;
}

export async function updateAudioDialogue(
	uuid: string,
	target_id: number,
	Socket: Socket,
	mp3Path: string,
) {
	const transcript = await audioToText(mp3Path);

	// Migrated from Redis to Postgres: from 1.0.0
	const data = await db.query.appSessions.findFirst({
		where: eq(appSessions.uuid, uuid),
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
										content: transcript,
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

	await updateAndBroadcastDiffToAll(uuid, newData, Socket);
}
