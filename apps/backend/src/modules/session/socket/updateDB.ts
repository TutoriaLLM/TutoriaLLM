import { db } from "@/db";
import { appSessions } from "@/db/schema";
import type { SessionValueWithoutUserInfo } from "@/modules/session/schema";
import { eq } from "drizzle-orm";
import { createPatch } from "rfc6902";
import type { Socket } from "socket.io";
import {} from "typescript";

// Functions excluding privacy sensitive information. Save but do not send.
function removePrivacyInfo(
	data: SessionValueWithoutUserInfo,
): SessionValueWithoutUserInfo {
	const removedData = {
		...data,
		userAudio: "",
	};
	return removedData;
}

// If you broadcast as is, notifications will be sent to all rooms, so be sure to specify the room properly!

// Function to broadcast changes and update the database
// Note: No value is returned to the client who made the change.
const updateAndBroadcastDiff = async (
	sessionId: string,
	newData: SessionValueWithoutUserInfo,
	socket: Socket,
) => {
	const existingDataJson = await db
		.select()
		.from(appSessions)
		.where(eq(appSessions.sessionId, sessionId));

	const existingData: SessionValueWithoutUserInfo = existingDataJson[0];

	const dataWithoutPrivacy = removePrivacyInfo(newData);

	const diff = existingData
		? createPatch(existingData, dataWithoutPrivacy)
		: [];

	if (diff.length > 0) {
		await db
			.update(appSessions)
			.set(newData)
			.where(eq(appSessions.sessionId, sessionId))
			.execute();
		// socket.broadcast.emit("PushSessionDiff", diff);
		socket.to(sessionId).emit("PushSessionDiff", diff);
	}
};

// Broadcast new changes to all clients
const updateAndBroadcastDiffToAll = async (
	sessionId: string,
	newData: SessionValueWithoutUserInfo,
	socket: Socket,
) => {
	const existingDataJson = await db
		.select()
		.from(appSessions)
		.where(eq(appSessions.sessionId, sessionId));
	const existingData: SessionValueWithoutUserInfo = existingDataJson[0];

	const dataWithoutPrivacy = removePrivacyInfo(newData);

	const diff = existingData
		? createPatch(existingData, dataWithoutPrivacy)
		: [];

	if (diff.length > 0) {
		await db
			.update(appSessions)
			.set(newData)
			.where(eq(appSessions.sessionId, sessionId))
			.execute();
		socket.emit("PushSessionDiff", diff);
		// socket.broadcast.emit("PushSessionDiff", diff);
		socket.to(sessionId).emit("PushSessionDiff", diff);
	}
};

export { updateAndBroadcastDiff, updateAndBroadcastDiffToAll };
