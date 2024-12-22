import { registerBlocks } from "@/libs/registerBlocks";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

export default async function codeGen(
	serializedWorkspace: {
		[key: string]: string;
	},
	language: string,
) {
	// Workspace Definition
	const workspace = new Blockly.Workspace();

	// Block Registration
	await registerBlocks(language);

	// Loading a workspace
	Blockly.serialization.workspaces.load(serializedWorkspace, workspace);

	// Convert workspace to JavaScript code
	const generatedCode = javascriptGenerator.workspaceToCode(workspace);
	console.info("generated code", generatedCode);

	return generatedCode;
}
