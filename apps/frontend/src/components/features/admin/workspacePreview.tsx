import registerBlocks from "@/components/common/Blockly/blocks/index.js";
import Theme from "@/components/common/Blockly/theme/index.js";
import { translateCategories } from "@/components/common/Blockly/toolbox/index.js";
import type { SessionValue } from "@/type.js";
import * as Blockly from "blockly";
import { useEffect, useRef } from "react";

export default function WorkspacePreview(props: { session: SessionValue }) {
	const { session } = props;
	const blocklyDivRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!blocklyDivRef.current) return;

		// Create a Blockly workspace
		const workspace = Blockly.inject(blocklyDivRef.current, {
			theme: Theme,
			renderer: "zelos",
			media: "/",
			trashcan: false,

			grid: {
				spacing: 20,
				length: 3,
				colour: "#ccc",
				snap: true,
			},
			readOnly: true,
			move: {
				scrollbars: true,
				wheel: true,
				drag: true,
			},
		});

		// Registration of Extension Blocks
		registerBlocks(session.language as string);
		translateCategories(session.language as string);

		// Load serialized workspace
		Blockly.serialization.workspaces.load(session.workspace || {}, workspace);

		// Return function for cleanup (executed when component is unmounted)
		return () => {
			workspace.dispose();
		};
	}, [session.workspace]);

	return (
		<div className="bg-background rounded-2xl p-2 gap-2 w-full h-[60vh]">
			<h2 className="text-lg font-semibold">Workspace Preview</h2>
			<div
				id="blocklyPreviewDiv"
				ref={blocklyDivRef}
				className="w-full h-full p-2 pb-10"
			/>
		</div>
	);
}
