import type { Socket } from "socket.io";
import type { SessionValue } from "../../../type.js";
import { sessionDB } from "../../db/session.js";
import { createPatch } from "rfc6902";

//プライバシーに関わる情報を除く関数。保存はするが、送信はしない。
function removePrivacyInfo(data: SessionValue): SessionValue {
	const removedData = {
		...data,
		userAudio: "",
	};
	return removedData;
}

//変更点をブロードキャストし、データベースを更新する関数
//注意：変更を行なったクライアントには値は返されない
const updateAndBroadcastDiff = async (
	code: string,
	newData: SessionValue,
	socket: Socket,
) => {
	const existingDataJson = await sessionDB.get(code);
	const existingData: SessionValue = existingDataJson
		? JSON.parse(existingDataJson)
		: null;

	const dataWithoutPrivacy = removePrivacyInfo(newData);

	const diff = existingData
		? createPatch(existingData, dataWithoutPrivacy)
		: [];
	console.log("diff", diff);

	if (diff.length > 0) {
		await sessionDB.set(code, JSON.stringify(newData));
		socket.broadcast.emit("PushSessionDiff", diff);
	}
};

//すべてのクライアントに対して新しい変更点をブロードキャストする
const updateAndBroadcastDiffToAll = async (
	code: string,
	newData: SessionValue,
	socket: Socket,
) => {
	const existingDataJson = await sessionDB.get(code);
	const existingData: SessionValue = existingDataJson
		? JSON.parse(existingDataJson)
		: null;

	const dataWithoutPrivacy = removePrivacyInfo(newData);

	const diff = existingData
		? createPatch(existingData, dataWithoutPrivacy)
		: [];
	console.log("diff", diff);

	if (diff.length > 0) {
		await sessionDB.set(code, JSON.stringify(newData));
		socket.emit("PushSessionDiff", diff);
		socket.broadcast.emit("PushSessionDiff", diff);
	}
};

export { updateAndBroadcastDiff, updateAndBroadcastDiffToAll };
