import { Project, SyntaxKind, Node, type SourceFile } from "ts-morph";
import translate from "deepl";
import { promises as fs } from "node:fs";
import path from "node:path";

const DEEPL_AUTH_KEY = "";

/**
 * Checks if text contains Japanese characters
 */
function containsJapanese(text: string): boolean {
	return /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(
		text,
	);
}

/**
 * Translates text from Japanese to English using DeepL
 */
async function translateToEnglish(text: string): Promise<string> {
	try {
		const result = await translate({
			text,
			target_lang: "EN",
			auth_key: DEEPL_AUTH_KEY,
			free_api: true,
		});
		return result.data.translations[0].text;
	} catch (error) {
		console.error("Translation error:", error);
		return text; // Return original text if translation fails
	}
}

/**
 * コメント置換用に必要な情報
 */
interface CommentInfo {
	start: number;
	end: number;
	originalText: string; // 例: "// xxx", "/* xxx */", "/** xxx */"
	kind: SyntaxKind;
}

/**
 * すべてのコメント（通常コメント + JSDoc）を収集
 */
function collectComments(sourceFile: SourceFile): CommentInfo[] {
	const comments: CommentInfo[] = [];
	const visitedRanges = new Set<string>();
	const allNodes = sourceFile.getDescendants();

	for (const node of allNodes) {
		// 通常コメント (leading / trailing)
		const leading = node.getLeadingCommentRanges() || [];
		const trailing = node.getTrailingCommentRanges() || [];
		const commentRanges = [...leading, ...trailing];

		for (const commentRange of commentRanges) {
			const rangeKey = `${commentRange.getPos()}-${commentRange.getEnd()}`;
			if (visitedRanges.has(rangeKey)) continue;

			visitedRanges.add(rangeKey);

			const commentText = commentRange.getText();
			const kind = commentRange.getKind();
			// 日本語が含まれていれば翻訳対象
			if (containsJapanese(commentText)) {
				comments.push({
					start: commentRange.getPos(),
					end: commentRange.getEnd(),
					originalText: commentText,
					kind,
				});
			}
		}

		// --- JSDocコメント ---
		if (Node.isJSDocable(node)) {
			const jsDocs = node.getJsDocs();
			for (const jsDoc of jsDocs) {
				// JSDocのフルテキスト: "/** ... */"
				const docText = jsDoc.getText();
				if (containsJapanese(docText)) {
					const start = jsDoc.getStart();
					const end = jsDoc.getEnd();
					const rangeKey = `${start}-${end}`;
					if (!visitedRanges.has(rangeKey)) {
						visitedRanges.add(rangeKey);
						// JSDoc はMultiLineの一種だが、/** ... */ を扱うため独自に kind を設定
						comments.push({
							start,
							end,
							originalText: docText,
							kind: SyntaxKind.JSDocComment, // カスタム扱い
						});
					}
				}
			}
		}
	}
	return comments;
}

/**
 * コメントテキストから「コメント構文」を除いた純粋な本文のみを抜き出す
 */
function stripCommentDelimiters(text: string, kind: SyntaxKind): string {
	// JSDoc: "/** ... */"
	if (kind === SyntaxKind.JSDocComment) {
		// "/**" と "*/" を取り除く
		// ただし "/**" と "*/" は複数パターンあるかもしれないので一番外側だけを安全に除去
		return text.replace(/^\/\*\*\s?/, "").replace(/\*\/$/, "");
	}

	// マルチラインコメント: "/* ... */"
	if (kind === SyntaxKind.MultiLineCommentTrivia) {
		return text.replace(/^\/\*\s?/, "").replace(/\*\/$/, "");
	}

	// シングルラインコメント: "// ..."
	if (kind === SyntaxKind.SingleLineCommentTrivia) {
		return text.replace(/^\/\/\s?/, "");
	}

	// その他の場合(稀)はそのまま返す
	return text;
}

/**
 * 翻訳したテキストを「適切なコメント構文」に戻す
 */
function wrapWithCommentDelimiters(
	translated: string,
	kind: SyntaxKind,
): string {
	if (kind === SyntaxKind.JSDocComment) {
		// JSDoc 形式
		// たとえ内部の '*' が減っても大丈夫なように、ここで必ず "/** ... */" 形式にする
		return `/** ${translated} */`;
	}

	if (kind === SyntaxKind.MultiLineCommentTrivia) {
		return `/* ${translated} */`;
	}

	if (kind === SyntaxKind.SingleLineCommentTrivia) {
		return `// ${translated}`;
	}

	return translated;
}

/**
 * 収集したコメントを翻訳→コメント構文を再付与→ソースに置き換え
 */
async function translateAndReplaceComments(
	sourceFile: SourceFile,
	commentInfos: CommentInfo[],
) {
	// 座標が後ろのものから順に処理する（ズレ防止）
	commentInfos.sort((a, b) => b.end - a.end);

	for (const info of commentInfos) {
		// 1. コメント記号を除去して純粋な本文だけを取り出す
		const stripped = stripCommentDelimiters(info.originalText, info.kind);

		// 2. 翻訳
		const translated = await translateToEnglish(stripped);

		// 3. 適切なコメント構文で包む
		const wrapped = wrapWithCommentDelimiters(translated, info.kind);

		// 4. ソースコードを書き換え
		sourceFile.replaceText([info.start, info.end], wrapped);
	}
}

/**
 * Processes a single source file
 */
async function processSourceFile(filePath: string): Promise<void> {
	const project = new Project();
	const sourceFile = project.addSourceFileAtPath(filePath);

	// 1. コメント情報をすべて収集
	const commentInfos = collectComments(sourceFile);

	// 2. 翻訳 & 一括置換
	await translateAndReplaceComments(sourceFile, commentInfos);

	// 3. Save changes
	await sourceFile.save();
}

/**
 * Recursively finds all TypeScript/JavaScript files in a directory
 */
async function findSourceFiles(dir: string): Promise<string[]> {
	const files: string[] = [];
	const entries = await fs.readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			files.push(...(await findSourceFiles(fullPath)));
		} else if (/\.(ts|js|tsx|jsx)$/.test(entry.name)) {
			files.push(fullPath);
		}
	}

	return files;
}

/**
 * Main function to process all files in the src directory
 */
async function main() {
	try {
		const srcDir = path.join(process.cwd(), "src");
		const sourceFiles = await findSourceFiles(srcDir);

		console.log(`Found ${sourceFiles.length} source files to process`);

		for (const file of sourceFiles) {
			console.log(`Processing ${file}...`);
			await processSourceFile(file);
		}

		console.log("Successfully processed all files");
	} catch (error) {
		console.error("Error processing files:", error);
		process.exit(1);
	}
}

main();
