import fs from "node:fs";
import path from "node:path";
import { type NewTutorial, Tutorial, UpdatedTutorial } from "../../type.js";
import { extractMetadata } from "../../utils/extractTutorialMetadata.js";
import { db } from "./index.js";

// マークダウンファイルを取得する関数
function getMarkdownFiles(dir: string): string[] {
	let results: string[] = [];
	const list = fs.readdirSync(dir);
	for (const file of list) {
		const filePath = path.resolve(dir, file);
		const stat = fs.statSync(filePath);
		if (stat?.isDirectory()) {
			// 再帰的にディレクトリを探索
			results = results.concat(getMarkdownFiles(filePath));
		} else if (filePath.endsWith(".md") && filePath.includes("/tutorials/")) {
			// マークダウンファイルをリストに追加
			results.push(filePath);
		}
	}
	return results;
}

// デフォルトチュートリアル(拡張機能から提供されたもの)を再読み込み
export async function reloadDefaultTutorials() {
	// すべてのチュートリアルを削除
	db.deleteFrom("tutorials").executeTakeFirstOrThrow();

	// マークダウンファイルのパスを取得
	const tutorialFiles = getMarkdownFiles(path.resolve("src/extensions"));

	// デフォルトチュートリアルを再読み込み
	for (const file of tutorialFiles) {
		const content = fs.readFileSync(file, "utf-8");
		const { metadata, content: fullContent } = extractMetadata(content);

		if (metadata.title && metadata.description) {
			db.insertInto("tutorials")
				.values({
					content: fullContent,
					metadata: JSON.stringify(metadata),
				} as NewTutorial)
				.executeTakeFirstOrThrow();
		} else {
			console.log(`File ${file} does not contain valid metadata.
        please include'title' and 'description' in the metadata.`);
		}
	}
}

// チュートリアルDBの初期化
if (process.argv.includes("--reset-tutorials")) {
	(async () => {
		await reloadDefaultTutorials();
	})();
}
