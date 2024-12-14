import * as Blockly from "blockly";
import { workspaceToPngBase64 } from "../ui/workspaceToPng.js";
import Theme from "./Blockly/theme/index.js";
async function generateImageFromBlockName(
	hiddenWorkspaceRef: React.MutableRefObject<Blockly.WorkspaceSvg | null>,
	hiddenDivRef: React.MutableRefObject<HTMLDivElement | null>,
	blockName: string,
) {
	if (!hiddenWorkspaceRef.current) {
		const hiddenDiv = document.createElement("div");
		hiddenDiv.style.width = "100vw"; // Set appropriate width
		hiddenDiv.style.height = "100vh"; // Set appropriate height
		hiddenDiv.style.position = "absolute";
		hiddenDiv.style.top = "-100vh"; // Position off-screen
		hiddenDiv.style.left = "-100vw"; // Position off-screen
		hiddenDiv.style.visibility = "hidden"; // Hide the div

		document.body.appendChild(hiddenDiv);
		hiddenDivRef.current = hiddenDiv; // Store the div in the ref

		hiddenWorkspaceRef.current = Blockly.inject(hiddenDiv, {
			readOnly: true,
			renderer: "zelos",
			theme: Theme,
		});
	}

	const workspaceSvg = hiddenWorkspaceRef.current;

	// Add block
	const block = workspaceSvg.newBlock(blockName);
	block.initSvg();

	// Render block
	block.render();

	// Generate image of workspace
	return await workspaceToPngBase64(workspaceSvg);
}

export default generateImageFromBlockName;
