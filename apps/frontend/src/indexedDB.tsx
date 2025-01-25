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

export { saveImageToIndexedDB, getImageFromIndexedDB };
