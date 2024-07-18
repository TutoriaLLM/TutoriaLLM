import fastGlob from "fast-glob";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import path from "node:path";

/// <reference types="vite/client" />

export default async function codeGen(
	serializedWorkspace: {
		[key: string]: any;
	},
	language: string,
) {
	// ワークスペースの定義
	const workspace = new Blockly.Workspace();

	// ブロックの登録
	await registerBlocks(language);

	// ワークスペースの読み込み
	Blockly.serialization.workspaces.load(serializedWorkspace, workspace);

	// ワークスペースをJavaScriptコードに変換
	const generatedCode = javascriptGenerator.workspaceToCode(workspace);
	console.log("generated code", generatedCode);

	return generatedCode;
}

async function registerBlocks(language: string) {
	const rootDir = process.cwd();
	const blockFiles = await fastGlob(
		path.join(rootDir, "src/extensions/*/blocks/**/*.*"),
	);

	await Promise.all(
		blockFiles.map(async (file) => {
			try {
				const filePath = path.resolve(file);
				const mod = await import(filePath);

				if (mod.block && mod.code) {
					const { block, code, locale } = mod;
					console.log("registerBlocks", block);

					Blockly.Blocks[block.type] = {
						init: function () {
							this.jsonInit(block);
						},
					};

					code();

					if (locale?.[language]) {
						// localeが記述されている場合は登録する(json形式)
						console.log("register locale", locale);
						console.log("register language", language);
						for (const key in locale[language]) {
							if (Object.prototype.hasOwnProperty.call(locale[language], key)) {
								Blockly.Msg[key] = locale[language][key];
							}
						}
					}
				} else {
					console.warn(`Module ${filePath} does not export 'block' or 'code'`);
				}
			} catch (error) {
				console.error(`Error loading block file ${file}:`, error);
			}
		}),
	);
}
