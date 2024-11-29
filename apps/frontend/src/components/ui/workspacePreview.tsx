import React, { useEffect, useRef } from "react";
import * as Blockly from "blockly";
import Theme from "../Editor/Blockly/theme/index.js";
import { translateCategories } from "../Editor/Blockly/toolbox/index.js";
import registerBlocks from "../Editor/Blockly/blocks/index.js";
import type { SessionValue } from "@/type.js";

export default function WorkspacePreview(props: { session: SessionValue }) {
	const { session } = props;
	const blocklyDivRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!blocklyDivRef.current) return;

		// Blockly のワークスペースを作成
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

		//拡張ブロックの登録
		//console.log("registerBlocks");
		registerBlocks(session.language as string);
		translateCategories(session.language as string);

		// シリアライズされたワークスペースをロード
		Blockly.serialization.workspaces.load(session.workspace || {}, workspace);

		// クリーンアップ用の関数を返す（コンポーネントがアンマウントされたときに実行される）
		return () => {
			workspace.dispose();
		};
	}, [session.workspace]);

	return (
		<div className="bg-gray-100 rounded-2xl p-2 gap-2 w-full h-[60vh]">
			<h2 className="text-lg font-semibold">Workspace Preview</h2>
			<div
				id="blocklyPreviewDiv"
				ref={blocklyDivRef}
				className="w-full h-full p-2 pb-10"
			/>
		</div>
	);
}
