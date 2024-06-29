import sqlite from "better-sqlite3";
import fs from "fs";
import path from "path";
import { extractMetadata } from "../../utils/extractTutorialMetadata.js";

// ディレクトリが存在するかどうかを確認し、存在しない場合は作成
const dbDirectory = path.dirname("dist/tutorials.db");
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

// SQLiteデータベースを開く
export const tutorialDB = sqlite("dist/tutorials.db");

tutorialDB.exec(`CREATE TABLE IF NOT EXISTS tutorials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    metadata TEXT NOT NULL
)`);

// マークダウンファイルを取得する関数
function getMarkdownFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      // 再帰的にディレクトリを探索
      results = results.concat(getMarkdownFiles(filePath));
    } else if (filePath.endsWith(".md") && filePath.includes("/tutorials/")) {
      // マークダウンファイルをリストに追加
      results.push(filePath);
    }
  });
  return results;
}

// デフォルトチュートリアル(拡張機能から提供されたもの)を再読み込み
export async function reloadDefaultTutorials() {
  // すべてのチュートリアルを削除
  tutorialDB.exec(`DELETE FROM tutorials`);

  // マークダウンファイルのパスを取得
  const tutorialFiles = getMarkdownFiles(path.resolve("src/extensions"));

  // デフォルトチュートリアルを再読み込み
  for (const file of tutorialFiles) {
    const content = fs.readFileSync(file, "utf-8");
    const { metadata, content: fullContent } = extractMetadata(content);

    if (
      metadata &&
      metadata.marp === true &&
      metadata.title &&
      metadata.description
    ) {
      tutorialDB
        .prepare("INSERT INTO tutorials (content, metadata) VALUES (?, ?)")
        .run(fullContent, JSON.stringify(metadata));
    } else {
      console.log(`File ${file} does not contain valid metadata.
        please include 'marp: true', 'title' and 'description' in the metadata.`);
    }
  }
}

// チュートリアルDBの初期化
if (process.argv.includes("--reset-tutorials")) {
  (async () => {
    await reloadDefaultTutorials();
  })();
}
