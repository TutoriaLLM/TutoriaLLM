import {
	Handle,
	type NodeProps,
	NodeToolbar,
	Position,
	useHandleConnections,
	useNodesData,
	useReactFlow,
} from "@xyflow/react";

import {
	MDXEditor,
	type MDXEditorMethods,
	markdownShortcutPlugin,
} from "@mdxeditor/editor";
import {
	BlockTypeSelect,
	BoldItalicUnderlineToggles,
	ListsToggle,
	UndoRedo,
	headingsPlugin,
	listsPlugin,
	toolbarPlugin,
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";
import type {
	MyNode,
	markdownNode,
	workspaceNode,
} from "@/components/features/admin/TutorialEditor/nodes/nodetype";
import { Trash2 } from "lucide-react";
import React, { useEffect } from "react";

export function Markdown({ id, data }: NodeProps<markdownNode>) {
	const { updateNodeData, deleteElements } = useReactFlow();

	const handleSourceChange = (field: string, value: string) => {
		updateNodeData(id, { ...data, [field]: value });
	};

	const handleDelete = () => {
		deleteElements({ nodes: [{ id: id }] });
	};

	const connections = useHandleConnections({
		type: "target",
		id: "blockly",
	});

	// Obtain node data for Blockly handles to which they are connected
	const nodesData = useNodesData<MyNode>(
		connections.map((connection) => connection.source),
	);

	const mdxEditorRef = React.useRef<MDXEditorMethods>(null);

	// Update markdown in mdxEditor when data is changed
	useEffect(() => {
		if (mdxEditorRef.current) {
			mdxEditorRef.current.setMarkdown(data.editorContent);
		}

		// Check if Blockly node is connected
		if (nodesData && nodesData.length > 0) {
			const blocklyNode = nodesData.find((node) => node.type === "blockly");
			if (blocklyNode?.data) {
				const blocklyData = blocklyNode.data as workspaceNode["data"];
				const sessionValue = blocklyData.sessionValue;
				if (sessionValue) {
					handleSourceChange(
						"source",
						`${data.editorContent}\n\nThis is example of workspace:${JSON.stringify(
							sessionValue.workspace,
						)}`,
					);
				} else {
					handleSourceChange("source", data.editorContent);
				}
			}
			// If a Blockly node is connected but has no contents, output as is
			else {
				handleSourceChange("source", data.editorContent);
			}
		} else {
			// Output as is if no Blockly node is connected
			handleSourceChange("source", data.editorContent);
		}
	}, [data.editorContent, nodesData]);

	return (
		<div className="markdown-node w-full h-full flex flex-col bg-white border mdxeditor-popup-container cursor-auto rounded-xl overflow-clip">
			<span className="w-full h-4 bg-gray-300 custom-drag-handle cursor-move justify-center items-center flex gap-2">
				<span className="text-xs w-1 h-1 rounded-full bg-white" />
				<span className="text-xs w-1 h-1 rounded-full bg-white" />
				<span className="text-xs w-1 h-1 rounded-full bg-white" />
			</span>
			<NodeToolbar>
				<button type="button" className="text-red-500 " onClick={handleDelete}>
					<Trash2 className="drop-shadow" />
				</button>
			</NodeToolbar>

			<Handle
				id="blockly"
				type="target"
				position={Position.Left}
				style={{ background: "orange", padding: 5, zIndex: 1000 }}
				isValidConnection={(connection) =>
					connection.sourceHandle === "blockly"
				}
			/>

			<style>
				{`
          .mdxeditor-toolbar {
            background-color: #f8f8f8;
            border-bottom: 1px solid #9ca3af;
            border-radius: 0;
          }
          .mdxeditor-root-contenteditable {
            cursor: text;
          }
          .mdxeditor-popup-container {
            z-index: 1000;
          }
        `}
			</style>
			<Handle
				id="markdown"
				type="source"
				position={Position.Right}
				style={{ background: "red", padding: 5, zIndex: 1000 }}
				isValidConnection={(connection) =>
					connection.targetHandle === "markdown"
				}
			/>

			<MDXEditor
				ref={mdxEditorRef}
				contentEditableClassName="prose cursor-text"
				markdown={data.editorContent}
				onChange={(newMarkdown) =>
					handleSourceChange("editorContent", newMarkdown)
				}
				plugins={[
					toolbarPlugin({
						toolbarContents: () => (
							<>
								<UndoRedo />
								<BoldItalicUnderlineToggles />
								<ListsToggle />
								<BlockTypeSelect />
							</>
						),
					}),
					headingsPlugin(),
					listsPlugin(),
					markdownShortcutPlugin(),
				]}
			/>
		</div>
	);
}
