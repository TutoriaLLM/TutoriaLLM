import { saltAndHashPassword } from "@/utils/password";
import { db } from "@/db";
import { users } from "@/db/schema";

// ユーザーの認証情報をリセット
export async function resetCredentials(
	adminUsername: string,
	adminPasswordHash: string,
) {
	console.log("resetCredentials");

	// Create the initial admin user
	const result = await db
		.insert(users)
		.values({
			username: adminUsername,
			password: adminPasswordHash,
		})
		.onConflictDoNothing()
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
		const adminUsername = process.env.DEFAULT_USER_NAME as string; // Set your admin username here
		const defaultAdminPassword = process.env.DEFAULT_USER_PASSWORD as string; // Set your admin password here
		const adminPasswordHash = await saltAndHashPassword(defaultAdminPassword); // Save this hashed password securely

		resetCredentials(adminUsername, adminPasswordHash)
			.then((result) => {
				console.log("Admin user created:", result);
				process.exit();
			})
			.catch((error) => {
				console.error("Error creating admin user:", error);
				process.exit();
			});
	})();
}
