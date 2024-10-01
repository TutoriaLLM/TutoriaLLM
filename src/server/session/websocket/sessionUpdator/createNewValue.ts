import { applyPatch, type Operation } from "rfc6902";
import type { SessionValue } from "../../../../type.js";
import type { Socket } from "socket.io";

export default function createNewSessionValue(
	socket: Socket,
	currentDataJson: SessionValue,
	diff: Operation[],
): SessionValue {
	const newDataJson = JSON.parse(JSON.stringify(currentDataJson));
	const success = applyPatch(newDataJson, diff);
	if (!success) {
		console.error("Failed to apply patch");
		socket.emit("error", "Failed to apply patch");
		return currentDataJson;
	}
	return newDataJson;
}
