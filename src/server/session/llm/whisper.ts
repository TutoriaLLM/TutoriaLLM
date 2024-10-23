//受信したmp3を非同期で文字起こしし、Dialogueに保存（配信）する

import OpenAI from "openai";
import type { SessionValue } from "../../../type.js";
import fs from "node:fs";
import { updateAndBroadcastDiffToAll } from "../websocket/updateDB.js";
import { sessionDB } from "../../db/session.js";
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
	code: string,
	target_id: number,
	Socket: Socket,
	mp3Path: string,
) {
	const transcript = await audioToText(mp3Path);

	const rawData = await sessionDB.get(code);
	const data: SessionValue = rawData ? JSON.parse(rawData) : null;

	const newData = {
		//特定のIDのダイアログにAIのテキストを上書き
		...data,
		dialogue: [
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
		],
	};

	await updateAndBroadcastDiffToAll(data.sessioncode, newData, Socket);
}
