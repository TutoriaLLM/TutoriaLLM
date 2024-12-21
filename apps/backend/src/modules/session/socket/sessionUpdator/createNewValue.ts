import type { SessionValue } from "@/modules/session/schema";
import { type Operation, applyPatch } from "rfc6902";
import type { Socket } from "socket.io";

export default function createNewSessionValue(
	socket: Socket,
	currentDataJson: SessionValue,
	diff: Operation[],
): SessionValue {
	// Create deep copy
	const newDataJSON = structuredClone(currentDataJson);
	// Apply Patch
	const success = applyPatch(newDataJSON, diff);
	if (!success) {
		console.error("Failed to apply patch");
		socket.emit("error", "Failed to apply patch");
		return currentDataJson; // Return original value
	}

	return newDataJSON;
}
