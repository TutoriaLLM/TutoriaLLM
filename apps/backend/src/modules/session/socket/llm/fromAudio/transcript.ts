import type { Socket } from "socket.io";
import { db } from "@/db";
import { appSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateAndBroadcastDiffToAll } from "@/modules/session/socket/updateDB";
import { transcribeAudio } from "./whisper";

export async function generateTranscriptFromAudio(
	sessionId: string,
	target_id: number,
	Socket: Socket,
	wavOutputPath: string, //expected as wav
) {
	const transcript = await transcribeAudio(wavOutputPath);

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
										content: transcript || "Error from whisper",
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
