import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useReactFlow } from "@xyflow/react";
import {
	Bot,
	Braces,
	ChevronDown,
	ChevronRight,
	DownloadIcon,
	FileText,
	Notebook,
	Puzzle,
	SaveAll,
	Star,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Toolbar(props: {
	id: number | null;
	nodes: any[];
	edges: any[];
	setNodes: (nodes: any[]) => void;
	handleClosePopup: () => void;
	isPopupOpen: boolean;
}) {
	const { nodes, edges, handleClosePopup, isPopupOpen, setNodes } = props;

	const [isToolbarOpen, setIsToolbarOpen] = useState(false);

	useEffect(() => {
		// ポップアップが閉じられたらツールバーも閉じる
		if (!isPopupOpen) {
			setIsToolbarOpen(false);
		}
	}, [isPopupOpen]);

	function handleToggleToolbar(open: boolean) {
		setIsToolbarOpen(open); // `open` を使って状態を正しく更新
	}

	const { screenToFlowPosition } = useReactFlow();

	function creaeteNodeOnCenter(type: string, data?: any) {
		const screenX = window.innerWidth / 2;
		const screenY = window.innerHeight / 2;
		const x = screenToFlowPosition({
			x: screenX,
			y: screenY,
		}).x;
		const y = screenToFlowPosition({
			x: screenX,
			y: screenY,
		}).y;
		const node = {
			id: `${type + Math.random()}`,
			type: type,
			dragHandle: ".custom-drag-handle",
			position: { x, y },
			origin: [0.5, 0.5],
			data: data || undefined,
		};
		setNodes([...nodes, node]);
	}

	const handleSave = () => {
		const url =
			props.id === null
				? "/api/admin/tutorials/new"
				: `/api/admin/tutorials/${props.id}`;
		const method = props.id === null ? "POST" : "PUT";

		// Outputノードからデータを取得
		const outputNode = nodes.find((node) => node.type === "output");

		if (outputNode) {
			// Outputノードに接続されているエッジを取得
			const connectedEdges = edges.filter(
				(edge) => edge.target === outputNode.id,
			);

			// 接続されているノードのIDを取得
			const connectedNodeIds = connectedEdges.map((edge) => edge.source);

			// 接続されているノードを取得
			const connectedNodes = nodes.filter((node) =>
				connectedNodeIds.includes(node.id),
			);

			// contentとmetadataを初期化
			let content = "";
			let metadata = {};
			let tags = [];
			let language = "";

			// 接続されているノードからデータを取得
			for (const node of connectedNodes) {
				if (node.type === "md" || node.type === "mdGen") {
					content = node.data.source || ""; // Provide a default value
				} else if (node.type === "metadata" || node.type === "metadataGen") {
					//metadataとtagsを分離する
					metadata = {
						title: node.data.title,
						description: node.data.description,
						selectCount: node.data.selectCount,
					};
					language = node.data.language;
					tags = node.data.tags;
				}
			}

			// ノードをシリアライズ
			const serializednodes = JSON.stringify({ nodes, edges });

			// APIにデータを送信
			fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					serializednodes: serializednodes,
					metadata: metadata,
					tags: tags,
					language: language,
					content: content,
				}),
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error("Network response was not ok");
					}
					return response.text();
				})
				.then((data) => {
					console.log(data);
					alert("Tutorial saved successfully!");
					handleClosePopup();
				})
				.catch((error) => {
					console.error("Error saving tutorial:", error);
					alert("Failed to save tutorial");
				});
		} else {
			alert("Output node not found.");
		}
	};

	const handleDownload = () => {
		if (props.id === null) {
			alert("IDがありません。ダウンロードはできません。");
			return;
		}

		const url = `/api/admin/tutorials/${props.id}`;

		// APIからデータを取得してダウンロード
		fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.json();
			})
			.then((data) => {
				// Blobを作成してダウンロードリンクをクリックさせる
				const blob = new Blob([JSON.stringify(data, null, 2)], {
					type: "application/json",
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `tutorial_${props.id}.json`;
				a.click();
				URL.revokeObjectURL(url);
			})
			.catch((error) => {
				console.error("Error downloading tutorial:", error);
				alert("Failed to download tutorial");
			});
	};

	function MenuText(props: {
		title: string;
		description: string;
		icon?: JSX.Element;
	}) {
		return (
			<div className="flex gap-2">
				{props.icon}
				<div>
					<p className="font-semibold">{props.title}</p>
					<p className="font-base text-sm">{props.description}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full flex gap-3 bg-gray-300 rounded-2xl p-1.5">
			<div className="flex gap-2">
				<button
					type="button"
					onClick={handleSave}
					className="p-2 bg-green-500 hover:bg-green-400 text-white rounded-xl flex justify-between items-center gap-1"
				>
					Save <SaveAll />
				</button>
				{props.id !== null && (
					<button
						type="button"
						onClick={handleDownload}
						className="p-2 bg-red-500 hover:bg-red-400 text-white rounded-xl flex justify-between items-center gap-1"
					>
						Download <DownloadIcon />
					</button>
				)}
			</div>
			<span className="border-r border-gray-400" />
			<DropdownMenu.Root
				open={isToolbarOpen}
				onOpenChange={handleToggleToolbar}
			>
				<DropdownMenu.Trigger className="p-2 bg-blue-500 hover:bg-blue-400 transition-all text-white rounded-xl flex justify-between items-center gap-1">
					Add Nodes
					<ChevronDown />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content className="rounded-xl flex flex-col bg-white shadow p-1 gap-2">
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger className="rounded-xl cursor-default bg-gray-200 hover:bg-gray-300 transition-all p-2 flex justify-between items-center">
							<Star />
							Basic
							<ChevronRight />
						</DropdownMenu.SubTrigger>
						<DropdownMenu.Portal>
							<DropdownMenu.SubContent
								sideOffset={2}
								alignOffset={-5}
								className="rounded-xl bg-white shadow-md flex flex-col gap-1.5 p-1 left-10 min-w-56 z-[999] "
							>
								<DropdownMenu.Item
									className="rounded-xl bg-gray-200 hover:bg-gradient-to-r from-pink-100 to-red-300 cursor-pointer shadow p-1 px-2"
									onClick={() =>
										creaeteNodeOnCenter("md", {
											source: "",
											editorContent: "",
										})
									}
								>
									<MenuText
										title="Content"
										description="Write your content here"
										icon={<Notebook />}
									/>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									className="rounded-xl bg-gray-200 hover:bg-gradient-to-r from-sky-100 to-blue-300 cursor-pointer shadow p-1 px-2"
									onClick={() =>
										creaeteNodeOnCenter("metadata", {
											source: "",
											editorContent: "",
										})
									}
								>
									<MenuText
										title="Metadata"
										description="Write your metadata here"
										icon={<FileText />}
									/>
								</DropdownMenu.Item>
							</DropdownMenu.SubContent>
						</DropdownMenu.Portal>
					</DropdownMenu.Sub>
					<span className="border-b border-gray-300" />
					<DropdownMenu.Label className="p-0.5 px-2  font-semibold italic text-gray-800">
						Advanced
					</DropdownMenu.Label>
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger className="rounded-xl cursor-default bg-gray-200 hover:bg-red-300 transition-all p-2 flex justify-between items-center">
							<Braces />
							Content
							<ChevronRight />
						</DropdownMenu.SubTrigger>
						<DropdownMenu.Portal>
							<DropdownMenu.SubContent
								sideOffset={2}
								alignOffset={-5}
								className="rounded-xl bg-white shadow-md  flex flex-col gap-1.5 p-1 left-10 min-w-56 z-[999] "
							>
								<DropdownMenu.Item
									className="rounded-xl bg-gray-200 hover:bg-gradient-to-r from-pink-100 to-red-300 cursor-pointer shadow p-1 px-2"
									onClick={() =>
										creaeteNodeOnCenter("md", {
											source: "",
											editorContent: "",
										})
									}
								>
									<MenuText
										title="Content"
										description="Write your content here"
										icon={<Notebook />}
									/>
								</DropdownMenu.Item>
								<span className="border-b border-gray-300" />

								<DropdownMenu.Item
									className="rounded-xl bg-gray-200 hover:bg-gradient-to-r from-yellow-100 to-amber-300 cursor-pointer shadow p-1 px-2"
									onClick={() =>
										creaeteNodeOnCenter("blockly", {
											source: "",
											editorContent: "",
										})
									}
								>
									<MenuText
										title="Import Session"
										description="Import existing session into content"
										icon={<Puzzle />}
									/>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									className="rounded-xl bg-gray-200 hover:bg-gradient-to-r from-rose-200 to-red-300 cursor-pointer shadow p-1 px-2"
									onClick={() =>
										creaeteNodeOnCenter("mdGen", {
											source: "",
											editorContent: "",
										})
									}
								>
									<MenuText
										title="Refine Content"
										description="Generate new content from content"
										icon={<Bot />}
									/>
								</DropdownMenu.Item>
							</DropdownMenu.SubContent>
						</DropdownMenu.Portal>
					</DropdownMenu.Sub>
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger className="rounded-xl cursor-default bg-gray-200 hover:bg-blue-300 transition-all p-2 flex justify-between items-center">
							<FileText /> Metadata
							<ChevronRight />
						</DropdownMenu.SubTrigger>
						<DropdownMenu.Portal>
							<DropdownMenu.SubContent
								sideOffset={2}
								alignOffset={-5}
								className="rounded-xl bg-white shadow-md flex flex-col gap-1.5 p-1 left-10 min-w-56 z-[999] "
							>
								{" "}
								<DropdownMenu.Item
									className="rounded-xl bg-gray-200 hover:bg-gradient-to-r from-sky-100 to-blue-300 shadow p-1 px-2"
									onClick={() =>
										creaeteNodeOnCenter("metadata", {
											source: "",
											editorContent: "",
										})
									}
								>
									<MenuText
										title="Metadata"
										description="Write your metadata here"
										icon={<FileText />}
									/>
								</DropdownMenu.Item>
								<span className="border-b border-gray-300" />
								<DropdownMenu.Item
									className="rounded-xl bg-gray-200 hover:bg-gradient-to-r from-red-100 to-blue-300 shadow p-1 px-2"
									onClick={() =>
										creaeteNodeOnCenter("metadataGen", {
											source: "",
											editorContent: "",
										})
									}
								>
									<MenuText
										title="Generate Metadata"
										description="Generate metadata from content"
										icon={<Bot />}
									/>
								</DropdownMenu.Item>
							</DropdownMenu.SubContent>
						</DropdownMenu.Portal>
					</DropdownMenu.Sub>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	);
}
