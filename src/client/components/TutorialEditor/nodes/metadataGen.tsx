import React, { useEffect, useState } from "react";
import {
	Position,
	type NodeProps,
	Handle,
	useReactFlow,
	NodeToolbar,
	useHandleConnections,
	useNodesData,
} from "@xyflow/react";
import { MDXEditor, type MDXEditorMethods } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { Bot, Trash2 } from "lucide-react";
import CustomHandle from "../customHandle.js";
import type {
	markdownNode,
	mdToMetadataNode,
	metadataNode,
	MyNode,
} from "./nodetype.js";
import { use } from "i18next";
import { set } from "zod";

export function MetadataGen({ id, data }: NodeProps<mdToMetadataNode>) {
	const { updateNodeData, deleteElements } = useReactFlow();
	const [isGenerated, setIsGenerated] = useState(false);
	const [content, setContent] = useState(data.source || "");
	const [isLoading, setIsLoading] = useState(false);
	const initialMetadata = {
		title: data?.metaData?.title || "",
		description: data?.metaData?.description || "",
		tags: data?.metaData?.tags || "",
		language: data?.metaData?.language || "",
	};
	const [generatedMetadata, setGeneratedMetadata] = useState({
		title: initialMetadata.title,
		description: initialMetadata.description,
		tags: initialMetadata.tags,
		language: initialMetadata.language,
	});
	const [isCompared, setIsCompared] = useState(false);

	const handleDataChange = (metadata: {
		title: string;
		description: string;
		tags: string[];
		language: string;
	}) => {
		updateNodeData(id, { ...data, ...metadata });
	};

	const handleDelete = () => {
		deleteElements({ nodes: [{ id: id }] });
	};

	const metadataConnections = useHandleConnections({
		type: "target",
		id: "markdown",
	});

	const nodesData = useNodesData<markdownNode>(
		metadataConnections.map((connection) => connection.source),
	);
	//初期化時にAI生成されたデータがあれば、それを表示
	useEffect(() => {
		if (data.metaData) {
			setGeneratedMetadata(data.metaData);
			setIsGenerated(true);
			setIsCompared(true);
		}
	}, []);

	useEffect(() => {
		if (nodesData && nodesData.length > 0) {
			const mdNode = nodesData.find(
				(node) => node.type === "md" || node.type === "mdGen",
			);
			if (mdNode?.data) {
				const markdownData = mdNode.data as markdownNode["data"];
				setContent(markdownData.source);
			} else {
				resetMetadata();
			}
		} else {
			resetMetadata();
		}
	}, [nodesData]);

	const resetMetadata = () => {
		handleDataChange({
			title: "",
			description: "",
			tags: [],
			language: "",
		});
		setGeneratedMetadata({
			title: "",
			description: "",
			tags: [],
			language: "",
		});
		setContent("");
		setIsCompared(false);
		setIsGenerated(false);
	};

	const handleGenerateAI = async () => {
		setIsLoading(true);
		setIsCompared(false);
		setIsGenerated(false);
		try {
			const response = await fetch("/api/admin/tutorials/generate-metadata", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ content }),
			});
			const data = await response.json();
			const metadata = {
				title: data.title,
				description: data.description,
				tags: data.tags,
				language: data.language,
			};
			if (metadata && typeof metadata === "object") {
				console.log("Generated metadata:", metadata);
				setGeneratedMetadata(metadata);
				setIsGenerated(true);
				setIsCompared(true);
			} else {
				console.error("Invalid response format:", metadata);
			}
		} catch (error) {
			console.error("Error generating metadata:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (isGenerated) {
			handleDataChange({
				title: generatedMetadata.title,
				description: generatedMetadata.description,
				tags: generatedMetadata.tags,
				language: generatedMetadata.language,
			});
		}
	}, [isGenerated]);

	return (
		<div className="metadata-node w-full h-full flex flex-col bg-white border mdxeditor-popup-container cursor-auto rounded-xl overflow-clip">
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

			<CustomHandle
				id="markdown"
				type="target"
				position={Position.Left}
				style={{ bottom: 10, background: "red", padding: 5, zIndex: 1000 }}
				connectionCount={1}
			/>
			<Handle
				id="metadata"
				type="source"
				position={Position.Right}
				style={{ background: "blue", padding: 5, zIndex: 1000 }}
				isValidConnection={(connection) =>
					connection.targetHandle === "metadata"
				}
			/>
			<div className="flex justify-center flex-col items-center p-2">
				<h3 className="text-lg font-bold mb-2">Metadata Generator</h3>
				<button
					type="button"
					className="bg-sky-400 hover:sky-500 rounded-2xl p-2 flex gap-2 text-white"
					onClick={handleGenerateAI}
					disabled={isLoading}
				>
					<Bot className="drop-shadow" />
					{isLoading ? "Generating..." : "Generate Metadata from AI"}
				</button>
			</div>

			{isCompared && (
				<div className="w-full h-full p-4 bg-gray-100 border-t overflow-y-auto">
					<div className="flex gap-4 max-w-xl">
						<div className="w-[50%]">
							<h4 className="font-semibold">Original Content:</h4>
							<pre className="whitespace-pre-wrap break-words bg-gray-300 h-full max-h-80 cursor-text nowheel prose noscroll select-text overflow-y-auto p-2 border rounded">
								{content}
							</pre>
						</div>
						<div className="w-[50%]">
							<h4 className="font-semibold">AI Generated Metadata:</h4>
							<pre className="whitespace-pre-wrap break-words bg-gray-300 h-full max-h-80 cursor-text nowheel prose-sm noscroll select-text overflow-y-auto p-2 border rounded">
								{JSON.stringify(generatedMetadata)}
							</pre>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
