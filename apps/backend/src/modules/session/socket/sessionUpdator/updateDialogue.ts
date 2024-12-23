import { db } from "@/db";
import { appSessions } from "@/db/schema";
import { updateDialogue } from "@/utils/dialogueUpdater";

import { getBlockNames } from "@/libs/registerBlocks";
import type { SessionValue } from "@/modules/session/schema";
import { invokeLLM } from "@/modules/session/socket/llm";
import { eq } from "drizzle-orm";
import type { Socket } from "socket.io";

// Call LLM asynchronously and push when the message is created
export async function updateDialogueWithLLM(
	data: SessionValue,
	socket: Socket,
): Promise<SessionValue> {
	// At the end of processing, when the final data is returned, the previous data is re-retrieved.
	async function getLatestData(uuid: string) {
		// Migrated from Redis to Postgres: from 1.0.0
		const rawData = await db
			.select()
			.from(appSessions)
			.where(eq(appSessions.uuid, uuid));

		const data: SessionValue = rawData[0];
		return data;
	}

	const language = data.language;

	const blockNames = await getBlockNames();

	const message = await invokeLLM(data, blockNames, socket);

	// Processing when the output is audio
	// For testing purposes only, so the actual process of generating audio files is required
	// Save the bae64-encoded audio and add its ID to Dialogue
	if (
		typeof message !== "string" &&
		message &&
		"data" in message &&
		message.data
	) {
		const latestData = await getLatestData(data.uuid);
		const updatedAudios = [
			...(latestData.audios || []),
			{
				id: `${(latestData.audios?.length || 0) + 1}`,
				base64: message.data,
			},
		];

		// If the number of audios exceeds 5, the latest 5 should remain.
		if (updatedAudios.length > 5) {
			updatedAudios.splice(0, updatedAudios.length - 5);
		}

		return {
			...latestData,
			dialogue: [
				...(latestData.dialogue || []),
				{
					id: (data.dialogue?.length || 0) + 1,
					contentType: "ai_audio",
					isuser: false,
					content: JSON.stringify({
						id: `${updatedAudios.length}`,
						transcript: message.transcript,
					}),
				},
			],
			isReplying: false,
			audios: updatedAudios,
		};
	}

	// Processing when output is text
	if (typeof message !== "string" && message && "response" in message) {
		const latestData2 = await getLatestData(data.uuid);
		let updatedDialogue = updateDialogue(message.response, latestData2, "ai");

		// quick replies
		const updatedQuickReplies = [...(data.quickReplies || [])];
		if (message.quickReplies) {
			// Overwrite existing array
			updatedQuickReplies.splice(0, updatedQuickReplies.length);
			for (const reply of message.quickReplies) {
				updatedQuickReplies.push(reply);
			}
		}

		if (message.ui) {
			updatedDialogue = {
				...updatedDialogue,
				dialogue: [
					...(updatedDialogue.dialogue || []),
					{
						id: (updatedDialogue.dialogue?.length || 0) + 1,
						contentType: "ui",
						ui: message.ui,
						isuser: false,
						content: "",
					},
				],
			};
		}
		const latestData = await getLatestData(data.uuid);
		return {
			...latestData,
			dialogue: updatedDialogue.dialogue,
			quickReplies: updatedQuickReplies,
			isReplying: false,
			tutorial: {
				...latestData.tutorial,
				progress: message.progress,
			},
		};
	}

	// Processing when the message is a string
	if (typeof message === "string") {
		const updatedDialogue = updateDialogue(message, data, "ai");
		const latestData = await getLatestData(data.uuid);
		return {
			...latestData,
			dialogue: updatedDialogue.dialogue,
			isReplying: false,
		};
	}

	// Delete the user's audio if it is included
	if (data.userAudio) {
		const latestData = await getLatestData(data.uuid);
		latestData.userAudio = "";
		return latestData;
	}

	// If failed, retrieve the latest data and return it as is
	const latestData = await getLatestData(data.uuid);
	latestData.isReplying = false;
	return latestData;
}
