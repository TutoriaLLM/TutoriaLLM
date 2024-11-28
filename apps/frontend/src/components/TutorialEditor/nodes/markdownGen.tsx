import {
	Position,
	type NodeProps,
	Handle,
	useReactFlow,
	NodeToolbar,
	useHandleConnections,
	useNodesData,
} from "@xyflow/react";
import { useMutation } from "@/hooks/use-mutations";
import "@mdxeditor/editor/style.css";
import { useEffect, useState } from "react";
import type { markdownNode, mdToMdNode, MyNode } from "./nodetype.js";
import { Bot, Trash2 } from "lucide-react";
import CustomHandle from "../customHandle.js";
import Markdown from "react-markdown";
import { generateContent } from "@/api/admin/tutorials.js";

export function MarkdownGen({ id, data }: NodeProps<mdToMdNode>) {
	const { updateNodeData, deleteElements } = useReactFlow();
	const [isGenerated, setIsGenerated] = useState(false); // AI生成のフラグ
	const [markdown, setMarkdown] = useState(data.source || ""); // 初期値をdata.sourceから取得
	const [generatedMarkdown, setGeneratedMarkdown] = useState(
		data.outputFromAI || "",
	); // AIで生成されたMarkdown
	const [isCompared, setIsCompared] = useState(false); // 比較フラグ

	//sourceは入力したMarkdown, editorContentは出力するMarkdown

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

	//Markdownのinputノードを取得
	const nodesData = useNodesData<MyNode>(
		markdownConnections.map((connection) => connection.source),
	);

	//AI生成のデータがすでに存在する場合、それを表示
	useEffect(() => {
		if (data.outputFromAI) {
			setGeneratedMarkdown(data.outputFromAI);
			setIsGenerated(true);
			setIsCompared(true);
		}
	}, []);

	useEffect(() => {
		// nodesDataが存在する場合、他のノードのデータが更新されたかをチェック
		if (nodesData && nodesData.length > 0) {
			const markdownNode = nodesData.find((node) => node.type === "md");
			if (markdownNode?.data) {
				const markdownData = markdownNode.data as markdownNode["data"];

				// AI生成されたデータではなく、他のノードのデータが変更された場合
				if (markdown !== markdownData.source && !isGenerated) {
					setMarkdown(markdownData.source); // 他のノードデータを反映
					handleSourceChange("source", markdownData.source);
				}
				// 他のノードデータと現在のmarkdownが一致しない場合、AI生成を破棄
				if (isGenerated && markdown !== markdownData.source) {
					setIsGenerated(false); // AI生成フラグを解除
					setGeneratedMarkdown(""); // 生成されたMarkdownをクリア
				}
			} else {
				handleSourceChange("source", "");
				setGeneratedMarkdown(""); // 生成されたMarkdownをクリア
				setMarkdown(""); // 入力をクリア
				setIsCompared(false); // 比較フラグを解除
				setIsGenerated(false); // AI生成フラグを解除
			}
		} else {
			handleSourceChange("source", "");
			setGeneratedMarkdown(""); // 生成されたMarkdownをクリア
			setMarkdown(""); // 入力をクリア
			setIsCompared(false); // 比較フラグを解除
			setIsGenerated(false); // AI生成フラグを解除
		}
	}, [data.source, nodesData]); // markdownを依存関係から削除

	const { mutate, isPending } = useMutation({
		mutationFn: generateContent,
		onSuccess: (data) => {
			const content = data.content;
			if (content && typeof content === "string") {
				setGeneratedMarkdown(content);
				setIsGenerated(true);
				setIsCompared(true); // 比較フラグを立てる
				// 取得したデータをノードのデータに保存
				updateNodeData(id, { ...data, generatedMarkdown: content });
			} else {
				console.error("Invalid response format:", content);
			}
		},
		onError: (error) => {
			console.error("Error generating markdown:", error);
		},
	});

	// AI生成完了時のみsourceを更新
	useEffect(() => {
		if (isGenerated) {
			handleSourceChange("source", generatedMarkdown);
		}
	}, [generatedMarkdown, isGenerated]);

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
				<h3 className="text-lg font-bold mb-2">Comparison</h3>
				<button
					type="button"
					className="bg-sky-400 hoverLsky-500 rounded-2xl p-2 flex gap-2 text-white"
					onClick={() => {
						mutate({
							content: markdown,
						});
					}}
				>
					<Bot className="drop-shadow" />
					Generate Markdown from AI
				</button>
			</div>
			{/* 生成中のメッセージを表示 */}
			{isPending ? (
				<p className="w-full h-full p-2 text-center text-gray-500">
					Generating Markdown...
				</p>
			) : null}
			{/* 入力データと出力データの比較を表示 */}
			{isCompared && (
				<div className="w-full h-full p-4 bg-gray-100 border-t ">
					<div className="flex gap-4 max-w-xl">
						<div className="w-[50%]">
							<h4 className="font-semibold">Original Markdown:</h4>
							<pre className="whitespace-pre-wrap break-words bg-gray-300 h-full max-h-80 cursor-text nowheel prose noscroll select-text overflow-y-auto p-2 border rounded">
								<Markdown>{markdown}</Markdown>
							</pre>
						</div>
						<div className="w-[50%]">
							<h4 className="font-semibold">AI Generated Markdown:</h4>
							<pre className="whitespace-pre-wrap break-words bg-gray-300 h-full max-h-80 cursor-text nowheel prose-sm noscroll select-text overflow-y-auto p-2 border rounded">
								<Markdown>{generatedMarkdown}</Markdown>
							</pre>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
