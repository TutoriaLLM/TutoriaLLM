import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function getDbConnection() {
  console.log("getDbConnection");
  const db = await open({
    filename: "dist/users.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);

  return db;
}

export async function getUserFromDb(email: string, passwordHash: string) {
  console.log("getUserFromDb");
  const db = await getDbConnection();
  const user = await db.get(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, passwordHash]
  );
  return user;
}

export async function createUser(email: string, passwordHash: string) {
  console.log("createUser");
  const db = await getDbConnection();
  const result = await db.run(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, passwordHash]
  );
  return { id: result.lastID, email };
}
