import sqlite from "better-sqlite3";
import fs from "fs";
import path from "path";

// ディレクトリが存在するかどうかを確認し、存在しない場合は作成
const dbDirectory = path.dirname("dist/tutorials.db");
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

// SQLiteデータベースを開く
export const db = sqlite("dist/tutorials.db");

db.exec(`CREATE TABLE IF NOT EXISTS tutorials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    metadata TEXT NOT NULL
)`);
