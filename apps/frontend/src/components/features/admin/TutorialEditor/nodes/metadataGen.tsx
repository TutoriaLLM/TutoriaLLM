import {
	Handle,
	type NodeProps,
	NodeToolbar,
	Position,
	useHandleConnections,
	useNodesData,
	useReactFlow,
} from "@xyflow/react";
import { useEffect, useState } from "react";
import "@mdxeditor/editor/style.css";
import { generateMetadata } from "@/api/admin/tutorials";
import CustomHandle from "@/components/features/admin/TutorialEditor/customHandle";
import type {
	markdownNode,
	mdToMetadataNode,
} from "@/components/features/admin/TutorialEditor/nodes/nodetype";
import { useMutation } from "@/hooks/useMutations.js";
import { Bot, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MetadataGen({ id, data }: NodeProps<mdToMetadataNode>) {
	const { updateNodeData, deleteElements } = useReactFlow();
	const [isGenerated, setIsGenerated] = useState(false);
	const [content, setContent] = useState(data.source || "");

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
	// AI-generated data at initialization, if any
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

	const { mutate, isPending } = useMutation({
		mutationFn: generateMetadata,
		onMutate: () => {
			setIsCompared(false);
			setIsGenerated(false);
		},
		onSuccess: (metadata) => {
			if (metadata && typeof metadata === "object") {
				setGeneratedMetadata(metadata);
				setIsGenerated(true);
				setIsCompared(true);
			} else {
				console.error("Invalid response format:", metadata);
			}
		},
		onError: (error) => {
			console.error("Error generating metadata:", error);
		},
	});

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
		<div className="metadata-node w-full h-full flex flex-col bg-background border mdxeditor-popup-container cursor-auto rounded-xl overflow-clip">
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
				</Button>
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
				<Button
					type="button"
					onClick={() => {
						mutate({ content });
					}}
					disabled={isPending}
				>
					<Bot className="drop-shadow" />
					{isPending ? "Generating..." : "Generate Metadata from AI"}
				</Button>
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
