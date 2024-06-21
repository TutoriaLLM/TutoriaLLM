import sqlite from "better-sqlite3";
import { saltAndHashPassword } from "../../utils/password.js";
import fs from "fs";
import path from "path";

// ディレクトリが存在するかどうかを確認し、存在しない場合は作成
const dbDirectory = path.dirname("dist/users.db");
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

// SQLiteデータベースを開く
export const db = sqlite("dist/users.db");

db.exec(`CREATE TABLE IF NOT EXISTS users (
    id TEXT NOT NULL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
)`);

db.exec(`CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
)`);

// ユーザーの認証情報をリセット
export async function resetCredentials(
  adminUsername: string,
  adminPasswordHash: string
) {
  console.log("resetCredentials");

  // Clear the users table
  db.exec(`DELETE FROM users`);

  // Create the initial admin user
  const result = db
    .prepare("INSERT INTO users (id, username, password) VALUES (?, ?, ?)")
    .run("1", adminUsername, adminPasswordHash); // 'null' to '1' to ensure a valid ID

  return {
    id: result.lastInsertRowid,
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
