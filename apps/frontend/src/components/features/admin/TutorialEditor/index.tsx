import {
	Background,
	Controls,
	Panel,
	ReactFlow,
	addEdge,
	applyNodeChanges,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import "@xyflow/react/dist/style.css";
import { ExampleCode } from "@/components/features/admin/TutorialEditor/nodes/exampleCode";
import { Markdown } from "@/components/features/admin/TutorialEditor/nodes/markdown";
import { MarkdownGen } from "@/components/features/admin/TutorialEditor/nodes/markdownGen";
import { Metadata } from "@/components/features/admin/TutorialEditor/nodes/metadata";
import { MetadataGen } from "@/components/features/admin/TutorialEditor/nodes/metadataGen";
import Output from "@/components/features/admin/TutorialEditor/nodes/output";
import Toolbar from "@/components/features/admin/TutorialEditor/toolbar";
import type { Tutorial } from "@/type.js";
import { useSpecificTutorial } from "@/hooks/admin/tutorials";

type TutorialType = Pick<Tutorial, "metadata" | "content" | "serializednodes">;

const nodeTypes = {
	md: Markdown,
	mdGen: MarkdownGen,
	metadata: Metadata,
	metadataGen: MetadataGen,
	blockly: ExampleCode,
	output: Output,
};

export default function llTutorialEditor(props: {
	id: number | null;
	json?: TutorialType | null; // Add JSON as an argument
}) {
	const [tutorialData, setTutorialData] = useState<TutorialType | null>(
		props.json || null,
	); // Initialize json if available
	const { tutorial } = useSpecificTutorial(props.id || 0);

	const initialNodes = [
		{
			id: "metadata",
			type: "metadata",
			data: {
				title: "",
				description: "",
				tags: [],
			},
			dragHandle: ".custom-drag-handle",
			position: { x: 100, y: 100 },
		},
		{
			id: "md",
			type: "md",
			position: { x: 300, y: 400 },
			dragHandle: ".custom-drag-handle",
			data: { source: "", editorContent: "" },
		},
		{
			id: "blockly",
			type: "blockly",
			dragHandle: ".custom-drag-handle",
			data: {
				code: "",
			},
			position: { x: -200, y: 300 },
		},
		{
			id: "output",
			type: "output",
			data: {
				label: "",
				targetHandles: [{ id: "output-metadata" }, { id: "output-markdown" }],
			},

			position: { x: 800, y: 500 },
		},
	];

	const initialEdges = [
		{
			id: "metadata-output-initial",
			source: "metadata",
			target: "output",
			targetHandle: "metadata",
		},
		{
			id: "md-output-initial",
			source: "md",
			target: "output",
			targetHandle: "markdown",
		},
		{
			id: "blockly-md-initial",
			source: "blockly",
			target: "md",
			targetHandle: "blockly",
		},
	];

	const [nodes, setNodes] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	// Prevent "output" node from being deleted
	const onNodesChange = useCallback(
		(changes: any[]) => {
			setNodes((nds) => {
				const filteredChanges = changes.filter(
					(change: { type: string; id: string }) => {
						// Prevent deletion of the "output" node
						if (change.type === "remove" && change.id === "output") {
							alert("The 'output' node cannot be deleted.");
							return false;
						}
						return true;
					},
				);

				return applyNodeChanges(filteredChanges, nds);
			});
		},
		[setNodes],
	);

	// // Responsible for acquiring tutorial data and reflecting it in the editor
	useCallback(() => {
		if (props.id !== null && tutorial) {
			setTutorialData({
				metadata: tutorial.metadata,
				content: tutorial.content,
				serializednodes: tutorial.serializednodes,
			});
		} else if (props.json) {
			// If JSON data is available when creating a new file, use it.
			// If JSON is not in the specified format, display alert and use initial data
			if (
				!props.json.metadata ||
				!props.json.content ||
				!props.json.serializednodes
			) {
				alert("Invalid JSON format. Using default data.");
				setTutorialData({
					metadata: {
						title: "",
						description: "",
						selectCount: 0,
					},
					content: "",
					serializednodes: "",
				});
				return;
			}
			setTutorialData(props.json);
		} else {
			// Use default data for new creation
			setTutorialData({
				metadata: {
					title: "",
					description: "",
					selectCount: 0,
				},
				content: "",
				serializednodes: "",
			});
		}
	}, [props.id, props.json]);

	useEffect(() => {
		if (tutorialData?.serializednodes) {
			const flow = JSON.parse(tutorialData.serializednodes) as {
				nodes: any[];
				edges: any[];
			};
			setNodes(flow.nodes || []);
			setEdges(flow.edges || []);
		}
	}, [tutorialData, setNodes, setEdges]);

	const onConnect = useCallback(
		(params: any) => setEdges((eds) => addEdge(params, eds)),
		[setEdges],
	);

	return (
		<div className="w-full h-[100vh] flex-grow max-w-full max-h-full">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				nodeOrigin={[0.5, 0.5]}
				onConnect={onConnect}
				panOnScroll={true}
				zoomOnPinch={true}
			>
				<Panel>
					<Toolbar
						id={props.id}
						nodes={nodes}
						setNodes={setNodes}
						edges={edges}
						// handleClosePopup={handleClosePopup}
					/>
				</Panel>
				<Controls />
				<Background gap={12} size={1} />
			</ReactFlow>
		</div>
	);
}
