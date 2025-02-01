import { db } from "@/db";
import { tutorials } from "@/db/schema";
import type { Dialogue, SessionValue } from "@/modules/session/schema";
import createNewSessionValue from "@/modules/session/socket/sessionUpdator/createNewValue";
import { updateDialogueWithLLM } from "@/modules/session/socket/sessionUpdator/updateDialogue";
import {
	updateAndBroadcastDiff,
	updateAndBroadcastDiffToAll,
} from "@/modules/session/socket/updateDB";
import { eq } from "drizzle-orm";
import type { Operation } from "rfc6902";
import type { Socket } from "socket.io";

export async function updateSession(
	currentDataJson: SessionValue,
	diff: Operation[],
	socket: Socket,
) {
	const newDataJson = createNewSessionValue(socket, currentDataJson, diff);
	const sessionId = currentDataJson.sessionId;

	if (currentDataJson.sessionId !== newDataJson.sessionId) {
		socket.emit("error", "Invalid sessionId");
		socket.disconnect();
		return;
	}

	function isLastMessageByUser(dialogue: Dialogue[]) {
		const lastMessage = dialogue[dialogue.length - 1];
		return lastMessage.isUser;
	}

	function isDialogueChanged(oldData: SessionValue, newData: SessionValue) {
		return newData.dialogue !== oldData.dialogue;
	}

	// Added behavior when tutorial is selected
	if (
		newDataJson.tutorial !== currentDataJson.tutorial &&
		typeof newDataJson.tutorial.tutorialId === "number"
	) {
		// Increment DB's selectCount
		const id = newDataJson.tutorial.tutorialId;
		const tutorial = await db
			.select()
			.from(tutorials)
			.where(eq(tutorials.id, id));

		await db
			.update(tutorials)
			.set({
				metadata: {
					...tutorial[0].metadata,
					selectCount: tutorial[0].metadata.selectCount + 1,
				},
			})
			.where(eq(tutorials.id, id));
	}

	if (
		isDialogueChanged(currentDataJson, newDataJson) &&
		isLastMessageByUser(newDataJson.dialogue || []) &&
		newDataJson.isReplying === false
	) {
		// Send diffs to all clients except the sender
		updateAndBroadcastDiff(
			sessionId,
			{
				...newDataJson,
				stats: {
					...newDataJson.stats,
					totalInvokedLLM: newDataJson.stats.totalInvokedLLM + 1,
				},
				isReplying: true,
			},
			socket,
		);
		// The sender should only send diffs that set isReplying to true. Sending anything else will cause the sender to see the message twice.
		socket.emit("notifyIsReplyingforSender");

		updateDialogueWithLLM(newDataJson, socket)
			.then(async (responseOrError) => {
				updateAndBroadcastDiffToAll(sessionId, responseOrError, socket);
			})
			.catch((error) => {
				console.error("Error invoking LLM:", error);
			});
	} else {
		updateAndBroadcastDiff(sessionId, newDataJson, socket);
	}
}
