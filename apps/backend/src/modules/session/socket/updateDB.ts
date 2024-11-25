import type { Socket } from "socket.io";
// import { sessionDB } from "../../db/session.js";
import { db } from "../../../db/index.js";
import { createPatch } from "rfc6902";
import { appSessions } from "../../../db/schema.js";
import { eq } from "drizzle-orm";
import type { SessionValue } from "../schema.js";

//プライバシーに関わる情報を除く関数。保存はするが、送信はしない。
function removePrivacyInfo(data: SessionValue): SessionValue {
	const removedData = {
		...data,
		userAudio: "",
	};
	return removedData;
}

//そのままbroadcastすると、全ての部屋に対して通知されてしまうので、ちゃんと部屋を指定すること！

//変更点をブロードキャストし、データベースを更新する関数
//注意：変更を行なったクライアントには値は返されない
const updateAndBroadcastDiff = async (
	code: string,
	newData: SessionValue,
	socket: Socket,
) => {
	const existingDataJson = await db
		.select()
		.from(appSessions)
		.where(eq(appSessions.sessioncode, code));

	const existingData: SessionValue = existingDataJson[0];

	const dataWithoutPrivacy = removePrivacyInfo(newData);

	const diff = existingData
		? createPatch(existingData, dataWithoutPrivacy)
		: [];
	console.log("diff", diff);

	if (diff.length > 0) {
		await db
			.update(appSessions)
			.set(newData)
			.where(eq(appSessions.sessioncode, code))
			.execute();
		// socket.broadcast.emit("PushSessionDiff", diff);
		socket.to(code).emit("PushSessionDiff", diff);
	}
};

//すべてのクライアントに対して新しい変更点をブロードキャストする
const updateAndBroadcastDiffToAll = async (
	code: string,
	newData: SessionValue,
	socket: Socket,
) => {
	const existingDataJson = await db
		.select()
		.from(appSessions)
		.where(eq(appSessions.sessioncode, code));
	const existingData: SessionValue = existingDataJson[0];

	const dataWithoutPrivacy = removePrivacyInfo(newData);

	const diff = existingData
		? createPatch(existingData, dataWithoutPrivacy)
		: [];
	console.log("diff", diff);

	if (diff.length > 0) {
		await db
			.update(appSessions)
			.set(newData)
			.where(eq(appSessions.sessioncode, code))
			.execute();
		socket.emit("PushSessionDiff", diff);
		// socket.broadcast.emit("PushSessionDiff", diff);
		socket.to(code).emit("PushSessionDiff", diff);
	}
};

export { updateAndBroadcastDiff, updateAndBroadcastDiffToAll };
