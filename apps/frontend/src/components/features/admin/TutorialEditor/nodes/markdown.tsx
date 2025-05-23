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
	CustomNodeType,
	markdownNode,
	workspaceNode,
} from "@/components/features/admin/TutorialEditor/nodes/nodetype";
import { Maximize2, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

export function Markdown({ id, data }: NodeProps<markdownNode>) {
	const { updateNodeData, deleteElements } = useReactFlow();

	const [isWindowOpen, setIsWindowOpen] = useState(false);
	const { t } = useTranslation();

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
	const nodesData = useNodesData<CustomNodeType>(
		connections.map((connection) => connection.source),
	);

	const mdxEditorRef = React.useRef<MDXEditorMethods>(null);
	const dialogEditorRef = React.useRef<MDXEditorMethods>(null);

	// 共通のマークダウン変更ハンドラー
	const handleMarkdownChange = (newMarkdown: string) => {
		handleSourceChange("editorContent", newMarkdown);

		// 両方のエディタを同期
		if (mdxEditorRef.current) {
			mdxEditorRef.current.setMarkdown(newMarkdown);
		}
		if (dialogEditorRef.current) {
			dialogEditorRef.current.setMarkdown(newMarkdown);
		}
	};

	// Update markdown in mdxEditor when data is changed
	useEffect(() => {
		if (mdxEditorRef.current) {
			mdxEditorRef.current.setMarkdown(data.editorContent);
		}

		if (dialogEditorRef.current) {
			dialogEditorRef.current.setMarkdown(data.editorContent);
		}

		// Check if Blockly node is connected
		if (nodesData && nodesData.length > 0) {
			const blocklyNode = nodesData.find((node) => node.type === "blockly");
			if (blocklyNode?.data) {
				const blocklyData = blocklyNode.data as workspaceNode["data"];
				const workspace = blocklyData.workspace;
				if (workspace) {
					handleSourceChange(
						"source",
						`${data.editorContent}\n\nThis is example of workspace:\n\`\`\`${JSON.stringify(workspace, null, 2)}\`\`\``,
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
		<div className="markdown-node w-full h-full flex flex-col bg-background border mdxeditor-popup-container cursor-auto rounded-xl overflow-clip">
			<span className="w-full h-4 bg-border custom-drag-handle cursor-move flex justify-center items-center gap-2">
				<span className="text-xs w-1 h-1 rounded-full bg-accent-foreground" />
				<span className="text-xs w-1 h-1 rounded-full bg-accent-foreground" />
				<span className="text-xs w-1 h-1 rounded-full bg-accent-foreground" />
			</span>
			<NodeToolbar>
				<Button
					type="button"
					className="text-destructive-foreground"
					size="icon"
					variant="destructive"
					onClick={handleDelete}
				>
					<Trash2 className="drop-shadow" />
				</Button>{" "}
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
				onChange={handleMarkdownChange}
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
			<div className="flex justify-end">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setIsWindowOpen(true)}
				>
					<Maximize2 />
				</Button>
				<Dialog
					open={isWindowOpen}
					onOpenChange={(value) => {
						if (!value) {
							setIsWindowOpen(false);
						}
					}}
				>
					<DialogContent className="max-w-6xl h-full">
						<DialogHeader>
							<DialogTitle>{t("admin.markdownEditor")}</DialogTitle>
						</DialogHeader>
						<MDXEditor
							className="flex-1 overflow-auto min-h-[80vh]"
							ref={dialogEditorRef}
							contentEditableClassName="prose cursor-text min-w-full min-h-full bg-white"
							markdown={data.editorContent}
							onChange={handleMarkdownChange}
							plugins={[
								toolbarPlugin({
									toolbarClassName: "w-full",
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
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
