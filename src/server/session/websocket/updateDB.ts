import type { Socket } from "socket.io";
import type { SessionValue } from "../../../type.js";
import { sessionDB } from "../../db/session.js";
import { createPatch } from "rfc6902";

//変更点をブロードキャストし、データベースを更新する関数
const broadcastDiff = async (
	code: string,
	newData: SessionValue,
	socket: Socket,
) => {
	const existingDataJson = await sessionDB.get(code);
	const existingData: SessionValue = existingDataJson
		? JSON.parse(existingDataJson)
		: null;

	const diff = existingData ? createPatch(existingData, newData) : [];
	console.log("diff", diff);

	if (diff.length > 0) {
		await sessionDB.set(code, JSON.stringify(newData));
		socket.broadcast.emit("PushSessionDiff", diff);
	}
};

//すべてのクライアントに対して新しい変更点をブロードキャストする
const broadcastDiffToAll = async (
	code: string,
	newData: SessionValue,
	socket: Socket,
) => {
	const existingDataJson = await sessionDB.get(code);
	const existingData: SessionValue = existingDataJson
		? JSON.parse(existingDataJson)
		: null;

	const diff = existingData ? createPatch(existingData, newData) : [];
	console.log("diff", diff);

	if (diff.length > 0) {
		socket.emit("PushSessionDiff", diff);
		socket.broadcast.emit("PushSessionDiff", diff);
	}
};

export { broadcastDiff, broadcastDiffToAll };
