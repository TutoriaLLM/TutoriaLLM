import {
	Background,
	Controls,
	type Edge,
	type Node,
	Panel,
	ReactFlow,
	addEdge,
	applyNodeChanges,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { TutorialUploader } from "./upload";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/toast";
import { ErrorToastContent } from "@/components/common/toastContent";

type TutorialType = Pick<Tutorial, "metadata" | "content" | "serializednodes">;

const nodeTypes = {
	md: Markdown,
	mdGen: MarkdownGen,
	metadata: Metadata,
	metadataGen: MetadataGen,
	blockly: ExampleCode,
	output: Output,
};

export default function TutorialEditor(props: {
	tutorial: Tutorial | null;
}) {
	const { t } = useTranslation();
	const { toast } = useToast();
	const [tutorialData, setTutorialData] = useState<TutorialType | null>(null);
	//load tutorial data
	useEffect(() => {
		if (props.tutorial) {
			// if tutorial is passed, set the tutorial data
			setTutorialData({
				metadata: props.tutorial.metadata,
				content: props.tutorial.content,
				serializednodes: props.tutorial.serializednodes,
			});
		}
	}, [props.tutorial]);
	const [isUploaderOpen, setIsUploaderOpen] = useState(false);

	const initialNodes: Node[] = [
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

	const initialEdges: Edge[] = [
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
							toast({
								description: (
									<ErrorToastContent>
										{t("toast.outputNodeCannotBeDeleted")}
									</ErrorToastContent>
								),
								variant: "destructive",
							});
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

	useEffect(() => {
		if (tutorialData?.serializednodes) {
			const flow = JSON.parse(tutorialData.serializednodes) as {
				nodes: Node[];
				edges: Edge[];
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
			<Dialog
				open={isUploaderOpen}
				onOpenChange={(value) => {
					if (!value) {
						setIsUploaderOpen(false);
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("admin.uploader")}</DialogTitle>
						<DialogDescription>
							{t("admin.uploaderDescription")}
						</DialogDescription>
					</DialogHeader>
					<TutorialUploader
						setTutorialData={setTutorialData}
						onUpload={() => {
							setIsUploaderOpen(false);
						}}
					/>{" "}
				</DialogContent>
			</Dialog>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				nodeOrigin={[0.5, 0.5]}
				onConnect={onConnect}
				panOnScroll={true}
				noWheelClassName="no-wheel"
				zoomOnPinch={true}
			>
				<Panel>
					<Toolbar
						id={props.tutorial?.id || null}
						nodes={nodes}
						setNodes={setNodes}
						edges={edges}
						setIsUploadOpen={setIsUploaderOpen}
					/>
				</Panel>
				<Controls />
				<Background gap={12} size={1} />
			</ReactFlow>
		</div>
	);
}
