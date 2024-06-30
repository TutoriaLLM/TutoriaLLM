import sqlite from "better-sqlite3";
import { saltAndHashPassword } from "../../utils/password.js";
import fs from "fs";
import path from "path";
import { db } from "./index.js";
import { NewUser } from "../../type.js";

// ユーザーの認証情報をリセット
export async function resetCredentials(
  adminUsername: string,
  adminPasswordHash: string
) {
  console.log("resetCredentials");

  // Clear the users table
  db.deleteFrom("users").executeTakeFirstOrThrow();

  // Create the initial admin user
  const result = await db
    .insertInto("users")
    .values({
      username: adminUsername,
      password: adminPasswordHash,
    } as NewUser)
    .executeTakeFirstOrThrow();
  return {
    id: result.insertId,
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
