import fastGlob from "fast-glob";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import path from "node:path";

/// <reference types="vite/client" />

export default async function codeGen(serializedWorkspace: {
	[key: string]: any;
}) {
	// ワークスペースの定義
	const workspace = new Blockly.Workspace();

	// ブロックの登録
	await registerBlocks();

	// ワークスペースの読み込み
	Blockly.serialization.workspaces.load(serializedWorkspace, workspace);

	// ワークスペースをJavaScriptコードに変換
	const generatedCode = javascriptGenerator.workspaceToCode(workspace);
	console.log("generated code", generatedCode);

	return generatedCode;
}

async function registerBlocks() {
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
					const { block, code } = mod;
					console.log("registerBlocks", block);

					Blockly.Blocks[block.type] = {
						init: function () {
							this.jsonInit(block);
						},
					};

					code();
				} else {
					console.warn(`Module ${filePath} does not export 'block' or 'code'`);
				}
			} catch (error) {
				console.error(`Error loading block file ${file}:`, error);
			}
		}),
	);
}
