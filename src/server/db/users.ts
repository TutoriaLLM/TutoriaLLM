import sqlite3 from "sqlite3";
import { open } from "sqlite";
import process from "process";
import {
  saltAndHashPassword,
  comparePasswordToHash,
} from "../../utils/password.js";
import admin from "../admin/index.js";

export async function getDbConnection() {
  console.log("getDbConnection");
  const db = await open({
    filename: "dist/users.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      passwordHash TEXT
    )
  `);

  return db;
}

export async function getUserFromDb(username: string, password: string) {
  console.log("getUserFromDb");
  const db = await getDbConnection();
  // const user = await db.get(
  //   "SELECT * FROM users WHERE username = ? AND passwordHash = ?",
  //   [username, passwordHash]
  // );
  const user = await db.get("SELECT * FROM users WHERE username = ?", [
    username,
  ]);
  if (!user) {
    return null;
  }
  const match = await comparePasswordToHash(password, user.passwordHash);
  if (!match) {
    return null;
  }

  return user;
}

export async function createUser(username: string, passwordHash: string) {
  console.log("createUser");
  const db = await getDbConnection();
  const result = await db.run(
    "INSERT INTO users (username, passwordHash) VALUES (?, ?)",
    [username, passwordHash]
  );
  return { id: result.lastID, username };
}

// Function to reset credentials and create initial admin user
export async function resetCredentials(
  adminUsername: string,
  adminPasswordHash: string
) {
  console.log("resetCredentials");
  const db = await getDbConnection();

  // Clear the users table
  await db.exec(`DELETE FROM users`);

  // Create the initial admin user
  const result = await db.run(
    "INSERT INTO users (username, passwordHash) VALUES (?, ?)",
    [adminUsername, adminPasswordHash]
  );

  return {
    id: result.lastID,
    username: adminUsername,
    password: adminPasswordHash,
  };
}

// Check for command-line argument to reset credentials
if (process.argv.includes("--reset-credentials")) {
  const adminUsername = "admin"; // Set your admin username here
  // 初回設定時にパスワードをハッシュ化して保存する例
  const defaultAdminPassword = "admin"; // Set your admin password here
  const adminPasswordHash = await saltAndHashPassword(defaultAdminPassword); // Save this hashed password securely

  resetCredentials(adminUsername, adminPasswordHash)
    .then((result) => {
      console.log("Admin user created:", result);
    })
    .catch((error) => {
      console.error("Error creating admin user:", error);
    });
}
