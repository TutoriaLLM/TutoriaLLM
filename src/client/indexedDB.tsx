import { openDB } from "idb";
import type { SessionValue } from "../type.js";

// IndexedDBをオープンする関数（画像とセッションデータを同じDBで管理）
const dbPromise = openDB("app-data", 1, {
	upgrade(db) {
		// 画像用のオブジェクトストアを作成
		if (!db.objectStoreNames.contains("images")) {
			db.createObjectStore("images");
		}
		// セッションデータ用のオブジェクトストアを作成
		if (!db.objectStoreNames.contains("sessions")) {
			db.createObjectStore("sessions", { keyPath: "key" });
		}
	},
});

// IndexedDBに画像を保存する関数
async function saveImageToIndexedDB(key: string, image: string) {
	const db = await dbPromise;
	await db.put("images", image, key);
}

// IndexedDBから画像を取得する関数
async function getImageFromIndexedDB(key: string): Promise<string | null> {
	const db = await dbPromise;
	return await db.get("images", key);
}

// IndexedDBにセッションデータを保存する関数
async function saveSessionDataToIndexedDB(
	key: string,
	sessionValue: SessionValue,
) {
	const db = await dbPromise;
	await db.put("sessions", { key, sessionValue });
}

// IndexedDBからセッションデータを取得する関数
async function getSessionDataFromIndexedDB() {
	const db = await dbPromise;
	const allSessions = await db.getAll("sessions");
	const data: {
		[key: string]: { sessionValue: SessionValue };
	} = {};
	for (const session of allSessions) {
		data[session.key] = {
			sessionValue: session.sessionValue,
		};
	}
	return data;
}

// IndexedDBからセッションデータを削除する関数
async function deleteSessionDataFromIndexedDB(key: string) {
	const db = await dbPromise;
	await db.delete("sessions", key);
}

export {
	saveImageToIndexedDB,
	getImageFromIndexedDB,
	saveSessionDataToIndexedDB,
	getSessionDataFromIndexedDB,
	deleteSessionDataFromIndexedDB,
};
