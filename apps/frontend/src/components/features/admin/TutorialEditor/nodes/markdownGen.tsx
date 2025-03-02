import { useMutation } from "@/hooks/useMutations.js";
import {
	Handle,
	type NodeProps,
	NodeToolbar,
	Position,
	useHandleConnections,
	useNodesData,
	useReactFlow,
} from "@xyflow/react";
import "@mdxeditor/editor/style.css";
import { generateContent } from "@/api/admin/tutorials.js";
import CustomHandle from "@/components/features/admin/TutorialEditor/customHandle";
import type {
	CustomNodeType,
	markdownNode,
	mdToMdNode,
} from "@/components/features/admin/TutorialEditor/nodes/nodetype";
import { Bot, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function MarkdownGen({ id, data }: NodeProps<mdToMdNode>) {
	const { updateNodeData, deleteElements } = useReactFlow();
	const { t } = useTranslation();
	const [isGenerated, setIsGenerated] = useState(false); // AI generation flags
	const [markdown, setMarkdown] = useState(data.source || ""); // Get initial values from data.source
	const [generatedMarkdown, setGeneratedMarkdown] = useState(
		data.outputFromAI || "",
	); // AI-generated Markdown
	const [isCompared, setIsCompared] = useState(false); // Compare flag

	// source is the input Markdown, editorContent is the output Markdown

	const handleSourceChange = (field: string, value: string) => {
		updateNodeData(id, { ...data, [field]: value });
	};

	const handleDelete = () => {
		deleteElements({ nodes: [{ id: id }] });
	};

	const markdownConnections = useHandleConnections({
		type: "target",
		id: "markdown",
	});

	// Get Markdown input node
	const nodesData = useNodesData<CustomNodeType>(
		markdownConnections.map((connection) => connection.source),
	);

	// If AI-generated data already exists, display it
	useEffect(() => {
		if (data.outputFromAI) {
			setGeneratedMarkdown(data.outputFromAI);
			setIsGenerated(true);
			setIsCompared(true);
		}
	}, []);

	useEffect(() => {
		// If nodesData exists, check if data on other nodes has been updated
		if (nodesData && nodesData.length > 0) {
			const markdownNode = nodesData.find((node) => node.type === "md");
			if (markdownNode?.data) {
				const markdownData = markdownNode.data as markdownNode["data"];

				// If the data on other nodes has been changed instead of AI-generated data
				if (markdown !== markdownData.source && !isGenerated) {
					setMarkdown(markdownData.source); // Reflects other node data
					handleSourceChange("source", markdownData.source);
				}
				// Discard AI generation if current markdown does not match other node data
				if (isGenerated && markdown !== markdownData.source) {
					setIsGenerated(false); // Cancel AI generation flag
					setGeneratedMarkdown(""); // Clear generated Markdown
				}
			} else {
				handleSourceChange("source", "");
				setGeneratedMarkdown(""); // Clear generated Markdown
				setMarkdown(""); // Clear input
				setIsCompared(false); // Cancel comparison flag
				setIsGenerated(false); // Cancel AI generation flag
			}
		} else {
			handleSourceChange("source", "");
			setGeneratedMarkdown(""); // Clear generated Markdown
			setMarkdown(""); // Clear input
			setIsCompared(false); // Cancel comparison flag
			setIsGenerated(false); // Cancel AI generation flag
		}
	}, [data.source, nodesData]); // Remove markdown from dependencies

	const { mutate, isPending } = useMutation({
		mutationFn: generateContent,
		onSuccess: (data) => {
			const content = data.content;
			if (content && typeof content === "string") {
				setGeneratedMarkdown(content);
				setIsGenerated(true);
				setIsCompared(true); // set a comparison flag
				// Store acquired data in node data
				updateNodeData(id, { ...data, generatedMarkdown: content });
			} else {
				console.error("Invalid response format:", content);
			}
		},
		onError: (error) => {
			console.error("Error generating markdown:", error);
		},
	});

	// Update source only when AI generation is complete
	useEffect(() => {
		if (isGenerated) {
			handleSourceChange("source", generatedMarkdown);
		}
	}, [generatedMarkdown, isGenerated]);

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
					className="text-destructive-foreground "
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
				id="markdown"
				type="source"
				position={Position.Right}
				style={{ background: "red", padding: 5, zIndex: 1000 }}
				isValidConnection={(connection) =>
					connection.targetHandle === "markdown"
				}
			/>
			<div className="flex justify-center flex-col items-center p-2">
				<h3 className="text-lg font-bold mb-2">
					{t("admin.generatedMdComparison")}
				</h3>
				<Button
					type="button"
					onClick={() => {
						mutate({
							content: markdown,
						});
					}}
				>
					<Bot className="drop-shadow" />
					{t("admin.generateMarkdown")}
				</Button>
			</div>
			{/* Display messages being generated */}
			{isPending ? (
				<p className="w-full h-full p-2 text-center text-accent-foreground">
					{t("admin.generatingMarkdown")}
				</p>
			) : null}
			{/* Displays comparison of input and output data */}
			{isCompared && (
				<div className="w-full h-full p-4 bg-background border-t ">
					<div className="flex gap-4 max-w-xl">
						<div className="w-[50%] no-wheel">
							<h4 className="font-semibold">{t("admin.originalMd")}</h4>
							<pre className="whitespace-pre-wrap break-words bg-card h-full max-h-80 cursor-text nowheel prose noscroll select-text overflow-y-auto p-2 border rounded">
								<Markdown>{markdown}</Markdown>
							</pre>
						</div>
						<div className="w-[50%] no-wheel">
							<h4 className="font-semibold">{t("admin.generatedMd")}</h4>
							<pre className="whitespace-pre-wrap break-words bg-card h-full max-h-80 cursor-text nowheel prose-sm noscroll select-text overflow-y-auto p-2 border rounded">
								<Markdown>{generatedMarkdown}</Markdown>
							</pre>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
