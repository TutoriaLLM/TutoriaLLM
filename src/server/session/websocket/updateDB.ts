// updateDB.ts
import type { SessionValue } from "../../../type.js";
import { sessionDB } from "../../db/session.js";
import type ws from "ws";

const updateDatabase = async (
	code: string,
	newData: SessionValue,
	clients: Map<string, ws>,
) => {
	// 既存のセッションデータを取得
	const existingDataJson = await sessionDB.get(code);
	const existingData: SessionValue = existingDataJson
		? JSON.parse(existingDataJson)
		: null;

	// セッションデータに変更がある場合のみ更新
	if (
		existingData &&
		JSON.stringify(existingData) !== JSON.stringify(newData)
	) {
		await sessionDB.set(code, JSON.stringify(newData));

		// 全クライアントに更新を通知
		for (const id of newData.clients) {
			if (clients?.has(id)) {
				clients.get(id)?.send(JSON.stringify(newData));
			}
		}
	}
};

export default updateDatabase;
