import type { SessionValue, SessionValuePost } from "@/type";
import { openDB } from "idb";

// Function to open IndexedDB (manage images and session data in the same DB)
const dbPromise = openDB("app-data", 1, {
	upgrade(db) {
		// Create object store for images
		if (!db.objectStoreNames.contains("images")) {
			db.createObjectStore("images");
		}
		// Create object store for session data
		if (!db.objectStoreNames.contains("sessions")) {
			db.createObjectStore("sessions", { keyPath: "key" });
		}
	},
});

// Function to store images in IndexedDB
async function saveImageToIndexedDB(key: string, image: string) {
	const db = await dbPromise;
	await db.put("images", image, key);
}

// Function to retrieve images from IndexedDB
async function getImageFromIndexedDB(key: string): Promise<string | null> {
	const db = await dbPromise;
	return await db.get("images", key);
}

// Function to store session data in IndexedDB
async function saveSessionDataToIndexedDB(
	key: string,
	sessionValue: SessionValuePost,
) {
	const db = await dbPromise;
	await db.put("sessions", { key, sessionValue });
}

// Function to retrieve session data from IndexedDB
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

// Function to delete session data from IndexedDB
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
