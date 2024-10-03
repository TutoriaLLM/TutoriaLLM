import type { Socket } from "socket.io";
import type { Dialogue, SessionValue } from "../../../../type.js";
import type { Operation } from "rfc6902";
import createNewSessionValue from "./createNewValue.js";
import {
	updateAndBroadcastDiff,
	updateAndBroadcastDiffToAll,
} from "../updateDB.js";
import { updateDialogueWithLLM } from "./updateDialogue.js";

export async function updateSession(
	currentDataJson: SessionValue,
	diff: Operation[],
	socket: Socket,
) {
	const newDataJson = createNewSessionValue(socket, currentDataJson, diff);
	const code = currentDataJson.sessioncode;

	if (currentDataJson.uuid !== newDataJson.uuid) {
		socket.emit("error", "Invalid uuid");
		socket.disconnect();
		return;
	}

	function isLastMessageByUser(dialogue: Dialogue[]) {
		const lastMessage = dialogue[dialogue.length - 1];
		return lastMessage.isuser;
	}

	function isDialogueChanged(oldData: SessionValue, newData: SessionValue) {
		return newData.dialogue !== oldData.dialogue;
	}

	if (
		isDialogueChanged(currentDataJson, newDataJson) &&
		isLastMessageByUser(newDataJson.dialogue)
	) {
		updateAndBroadcastDiff(
			code,
			{
				...newDataJson,
				isReplying: true,
			},
			socket,
		);
		updateDialogueWithLLM(newDataJson)
			.then(async (responseorError) => {
				updateAndBroadcastDiffToAll(code, responseorError, socket);
			})
			.catch((error) => {
				console.error("Error invoking LLM:", error);
			});
	} else {
		updateAndBroadcastDiff(code, newDataJson, socket);
	}
}
