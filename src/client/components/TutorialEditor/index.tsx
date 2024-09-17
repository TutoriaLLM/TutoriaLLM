import React, { useState, useEffect, useCallback } from "react";
import Popup from "../Popup.js";
import type { Tutorial } from "../../../server/db/schema.js";

import {
	ReactFlow,
	useNodesState,
	useEdgesState,
	addEdge,
	Controls,
	Panel,
	Background,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Markdown } from "./nodes/markdown.js";
import { Metadata } from "./nodes/metadata.js";
import Output from "./nodes/output.js";
import Toolbar from "./toolbar.js";
import { ExampleCode } from "./nodes/exampleCode.js";

type TutorialType = Pick<Tutorial, "metadata" | "content" | "serializednodes">;

const nodeTypes = {
	md: Markdown,
	metadata: Metadata,
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
			id: "1",
			type: "metadata",
			data: {
				title: "",
				description: "",
				keywords: [],
			},
			position: { x: 100, y: 100 },
		},
		{
			id: "2",
			type: "md",
			position: { x: 300, y: 400 },
			dragHandle: ".custom-drag-handle",
			data: { source: "", editorContent: "" },
		},
		{
			id: "3",
			type: "blockly",
			dragHandle: ".custom-drag-handle",
			data: {
				code: "",
			},
			position: { x: 500, y: 300 },
		},
		{
			id: "output",
			type: "output",
			data: {
				label: "Output",
				targetHandles: [{ id: "output-metadata" }, { id: "output-markdown" }],
			},
			position: { x: 500, y: 300 },
		},
	];

	const initialEdges = [
		{
			id: "1-output",
			source: "1",
			target: "output",
			targetHandle: "metadata",
		},
		{
			id: "2-output",
			source: "2",
			target: "output",
			targetHandle: "markdown",
		},
	];

	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	// チュートリアルデータの取得とエディタへの反映を担当
	const fetchTutorialData = useCallback(async () => {
		if (props.id !== null) {
			setIsLoading(true); // データ取得開始時にローディングを開始
			try {
				const response = await fetch(`/api/admin/tutorials/${props.id}`);
				const data = (await response.json()) as Tutorial;
				console.log(data);
				setTutorialData({
					metadata: data.metadata,
					content: data.content,
					serializednodes: data.serializednodes,
				});
				setIsLoading(false); // データ取得完了後にローディングを終了
				setIsPopupOpen(true);
			} catch (error) {
				console.error("Error fetching tutorial data:", error);
				setIsLoading(false); // エラー時もローディングを終了
			}
		} else if (props.json) {
			// 新規作成時にJSONデータがある場合はそれを使用
			//JSONが指定したフォーマットでない場合はalertを表示し、初期データを使用
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
						keywords: [],
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
					keywords: [],
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
		<div className="w-[100vh] h-[100vh] flex-grow max-w-full max-h-full">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				panOnScroll
				zoomOnPinch
			>
				<Panel>
					<Toolbar
						id={props.id}
						nodes={nodes}
						edges={edges}
						handleClosePopup={handleClosePopup}
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
