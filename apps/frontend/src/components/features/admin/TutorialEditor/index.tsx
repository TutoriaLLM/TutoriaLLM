import Popup from "@/components/ui/Popup.js";
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
import { getSpecificTutorial } from "@/api/admin/tutorials.js";
import { ExampleCode } from "@/components/features/admin/TutorialEditor/nodes/exampleCode";
import { Markdown } from "@/components/features/admin/TutorialEditor/nodes/markdown";
import { MarkdownGen } from "@/components/features/admin/TutorialEditor/nodes/markdownGen";
import { Metadata } from "@/components/features/admin/TutorialEditor/nodes/metadata";
import { MetadataGen } from "@/components/features/admin/TutorialEditor/nodes/metadataGen";
import Output from "@/components/features/admin/TutorialEditor/nodes/output";
import Toolbar from "@/components/features/admin/TutorialEditor/toolbar";
import type { Tutorial } from "@/type.js";

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
	buttonText: string;
	json?: TutorialType | null; // JSONを引数として追加
}) {
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false); // ローディング状態を追加
	const [tutorialData, setTutorialData] = useState<TutorialType | null>(
		props.json || null,
	); // jsonがあれば初期化

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

	// チュートリアルデータの取得とエディタへの反映を担当
	const fetchTutorialData = useCallback(async () => {
		if (props.id !== null) {
			setIsLoading(true); // データ取得開始時にローディングを開始
			try {
				const response = await getSpecificTutorial({ id: props.id });
				setTutorialData({
					metadata: response.metadata,
					content: response.content,
					serializednodes: response.serializednodes,
				});
				setIsLoading(false); // データ取得完了後にローディングを終了
				setIsPopupOpen(true);
			} catch (error) {
				console.error("Error fetching tutorial data:", error);
				setIsLoading(false); // エラー時もローディングを終了
			}
		} else if (props.json) {
			// 新規作成時にJSONデータがある場合はそれを使用
			// JSONが指定したフォーマットでない場合はalertを表示し、初期データを使用
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
				setIsPopupOpen(true);
				return;
			}
			setTutorialData(props.json);
			setIsPopupOpen(true);
		} else {
			// 新規作成の場合はデフォルトのデータを使用
			setTutorialData({
				metadata: {
					title: "",
					description: "",
					selectCount: 0,
				},
				content: "",
				serializednodes: "",
			});
			setIsPopupOpen(true);
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

	const handleOpenPopup = () => {
		fetchTutorialData(); // データを取得してポップアップを開く
	};

	const handleClosePopup = () => {
		setIsPopupOpen(false);
	};

	const popupContent = (
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
						isPopupOpen={isPopupOpen}
					/>
				</Panel>
				<Controls />
				<Background gap={12} size={1} />
			</ReactFlow>
		</div>
	);

	return (
		<>
			<button
				type="button"
				className="rounded-2xl max-w-60 w-full bg-blue-500 p-2 text-white font-semibold"
				onClick={handleOpenPopup}
			>
				{props.buttonText}
			</button>
			{isLoading && <div>Loading...</div>} {/* ローディング中の表示 */}
			<Popup
				openState={isPopupOpen}
				onClose={handleClosePopup}
				Content={popupContent}
			/>
		</>
	);
}
