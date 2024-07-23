import fs from "node:fs";
import path from "node:path";
import sqlite from "better-sqlite3";
import { saltAndHashPassword } from "../../utils/password.js";
import { db } from "./index.js";
import { users } from "./schema.js";

// ユーザーの認証情報をリセット
export async function resetCredentials(
	adminUsername: string,
	adminPasswordHash: string,
) {
	console.log("resetCredentials");

	// Clear the users table
	db.delete(users).execute();

	// Create the initial admin user
	const result = await db
		.insert(users)
		.values({
			username: adminUsername,
			password: adminPasswordHash,
		})
		.returning({
			id: users.id,
		});
	return {
		id: result[0].id,
		username: adminUsername,
		password: adminPasswordHash,
	};
}

// Adminユーザーの認証情報をリセット
if (process.argv.includes("--reset-credentials")) {
	(async () => {
		const adminUsername = "admin"; // Set your admin username here
		const defaultAdminPassword = "admin"; // Set your admin password here
		const adminPasswordHash = await saltAndHashPassword(defaultAdminPassword); // Save this hashed password securely

		resetCredentials(adminUsername, adminPasswordHash)
			.then((result) => {
				console.log("Admin user created:", result);
			})
			.catch((error) => {
				console.error("Error creating admin user:", error);
			});
	})();
}