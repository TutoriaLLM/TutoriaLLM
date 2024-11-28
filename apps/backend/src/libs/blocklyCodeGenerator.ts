import { javascriptGenerator } from "blockly/javascript";
import { registerBlocks } from "@/libs/registerBlocks";
import * as Blockly from "blockly";

export default async function codeGen(
	serializedWorkspace: {
		[key: string]: string;
	},
	language: string,
) {
	console.log("codeGen running");
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
