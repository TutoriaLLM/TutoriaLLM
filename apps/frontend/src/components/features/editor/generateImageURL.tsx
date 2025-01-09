import registerBlocks from "@/components/common/Blockly/blocks/index.js";
import Theme from "@/components/common/Blockly/theme/index.js";
import { blocklyLocale } from "@/i18n/blocklyLocale.js";
import { workspaceToPngBase64 } from "@/libs/workspaceToPng.js";
import * as Blockly from "blockly";

function getImageFromSerializedWorkspace(
	serializedWorkspace: {
		[key: string]: any;
	},
	language: string,
	hiddenWorkspaceRef: React.MutableRefObject<Blockly.WorkspaceSvg | null>,
	hiddenDivRef: React.MutableRefObject<HTMLDivElement | null>,
) {
	registerBlocks(language as string);

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
		Blockly.setLocale(blocklyLocale[language]);
	}
	const workspaceSvg = hiddenWorkspaceRef.current;

	Blockly.serialization.workspaces.load(serializedWorkspace, workspaceSvg);

	const imageURL = workspaceToPngBase64(workspaceSvg);
	return imageURL;
}

export default getImageFromSerializedWorkspace;
