import {
	createTutorial,
	getSpecificTutorial,
	updateTutorial,
} from "@/api/admin/tutorials";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/toast";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { type Edge, type Node, useReactFlow } from "@xyflow/react";
import {
	Bot,
	Braces,
	CheckCircle,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	DownloadIcon,
	FileText,
	Notebook,
	Puzzle,
	SaveAll,
	Star,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import type { CustomnodeType } from "./nodes/nodeType";
import { useTranslation } from "react-i18next";
import {
	ErrorToastContent,
	SuccessToastContent,
} from "@/components/common/toastContent";

export default function Toolbar(props: {
	id: number | null;
	nodes: Node[];
	edges: Edge[];
	setNodes: (nodes: Node[]) => void;
	setIsUploadOpen: (open: boolean) => void;
}) {
	const { t } = useTranslation();
	const { nodes, edges, setNodes } = props;

	const { toast } = useToast();

	const router = useRouter();
	const queryClient = useQueryClient();
	const [isToolbarOpen, setIsToolbarOpen] = useState(false);

	function handleToggleToolbar(open: boolean) {
		setIsToolbarOpen(open); // Use `open` to update status correctly
	}

	const { screenToFlowPosition } = useReactFlow();

	function createNodeOnCenter(type: string, data?: any) {
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
		} satisfies Node;
		setNodes([...nodes, node]);
	}

	const { mutate: post } = useMutation({
		mutationFn: createTutorial,
		onSuccess: () => {
			toast({
				description: (
					<SuccessToastContent>
						{t("toast.createdTutorial")}
					</SuccessToastContent>
				),
			});
		},
		onError: () => {
			toast({
				description: (
					<ErrorToastContent>
						{t("toast.failedToCreateTutorial")}
					</ErrorToastContent>
				),
				variant: "destructive",
			});
		},
	});
	const { mutate: put } = useMutation({
		mutationFn: updateTutorial,
		onSuccess: () => {
			toast({
				description: (
					<p className="flex items-center justify-center gap-2">
						<CheckCircle className="text-secondary" />
						{t("toast.updatedTutorial")}
					</p>
				),
			});
		},
		onError: () => {
			toast({
				description: (
					<p className="flex items-center justify-center gap-2">
						<XCircle className="text-destructive" />
						{t("toast.failedToUpdateTutorial")}
					</p>
				),
				variant: "destructive",
			});
		},
	});

	const handleSave = () => {
		// Get data from Output node
		const outputNode = nodes.find((node) => node.type === "output");

		if (outputNode) {
			// Get the edge connected to the Output node
			const connectedEdges = edges.filter(
				(edge) => edge.target === outputNode.id,
			);

			// Get ID of connected node
			const connectedNodeIds = connectedEdges.map((edge) => edge.source);

			// Get connected nodes
			const connectedNodes = nodes.filter((node) =>
				connectedNodeIds.includes(node.id),
			);

			// // Get data from connected nodes
			// for (const node of connectedNodes as CustomnodeType[]) {
			// 	if (node.type === "md" || node.type === "mdGen") {
			// 		if ("source" in node.data) {
			// 			content = node.data.source || ""; // Provide a default value
			// 		}
			// 	} else if (node.type === "metadata" || node.type === "metadataGen") {
			// 		// Separate tags from metadata
			// 		if (
			// 			"title" in node.data &&
			// 			"description" in node.data &&
			// 			"selectCount" in node.data
			// 		) {
			// 			metadata = {
			// 				title: node.data.title,
			// 				description: node.data.description,
			// 				selectCount: node.data.selectCount || 0,
			// 			};
			// 		}
			// 		if ("tags" in node.data) {
			// 			tags = node.data.tags.map((tag) => tag);
			// 		}
			// 		if ("language" in node.data) {
			// 			language = node.data.language;
			// 		}
			// 	}
			// }

			function getConnectedNodeData(connectedNodes: CustomnodeType[]) {
				const isMarkdownNode = (node: CustomnodeType) =>
					node.type === "md" || node.type === "mdGen";

				const isMetadataNode = (node: CustomnodeType) =>
					node.type === "metadata" || node.type === "metadataGen";

				const data = connectedNodes.map((node) => {
					if (isMarkdownNode(node)) {
						return {
							content: "source" in node.data ? node.data.source : "",
						};
					}
					if (isMetadataNode(node)) {
						return {
							metadata: {
								title: "title" in node.data ? node.data.title : "",
								description:
									"description" in node.data ? node.data.description : "",
								selectCount:
									"selectCount" in node.data ? node.data.selectCount : 0,
								language: "language" in node.data ? node.data.language : "",
							},
							tags: "tags" in node.data ? node.data.tags : [],
						};
					}
				});
				return {
					content: data.find((d) => d && "content" in d)?.content || "",
					metadata: data.find((d) => d && "metadata" in d)?.metadata || {
						title: "",
						description: "",
						selectCount: 0,
					},
					language:
						data.find((d) => d && "metadata" in d && d.metadata)?.metadata
							?.language || "",
					tags: data.find((d) => d && "tags" in d)?.tags || [],
				};
			}

			const { metadata, tags, language, content } = getConnectedNodeData(
				connectedNodes as CustomnodeType[],
			);

			// Serialize node
			const serializedNodes = JSON.stringify({ nodes, edges });

			// Send data to API
			console.log(tags);

			if (props.id) {
				put({
					id: props.id,
					tutorial: {
						id: props.id,
						serializedNodes: serializedNodes,
						metadata: metadata,
						tags: tags.map((tag) => {
							return {
								name: tag,
								id: null, // ID is auto-generated by the API
							};
						}),
						language: language,
						content: content,
					},
				});
			} else {
				post({
					serializedNodes: serializedNodes,
					metadata: metadata,
					tags: tags.map((tag) => {
						return {
							name: tag,
							id: null, // ID is auto-generated by the API
						};
					}),
					language: language,
					content: content,
				});
			}
		} else {
			toast({
				description: t("toast.failedToSaveTutorial"),
			});
		}
	};

	const handleDownload = () => {
		if (props.id === null) {
			toast({
				description: t("toast.failedToDownloadTutorial"),
			});
			return;
		}

		getSpecificTutorial({ id: props.id }).then((data) => {
			const blob = new Blob([JSON.stringify(data, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `tutorial_${props.id}.json`;
			a.click();
			URL.revokeObjectURL(url);
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
		<div className="w-full flex flex-wrap gap-3 bg-background rounded-2xl p-1.5">
			<Button
				type="button"
				variant="destructive"
				onClick={() => {
					queryClient.invalidateQueries({
						queryKey: ["tutorials"],
						refetchType: "all",
					});
					router.history.back();
				}}
			>
				<ChevronLeft />
				{t("general.back")}
			</Button>
			<Button type="button" onClick={handleSave}>
				{t("general.save")} <SaveAll />
			</Button>
			<Button type="button" onClick={() => props.setIsUploadOpen(true)}>
				{t("general.upload")}
			</Button>

			{props.id !== null && (
				<Button type="button" onClick={handleDownload}>
					{t("general.download")} <DownloadIcon />
				</Button>
			)}
			<span className="border-r border-gray-400" />
			<DropdownMenu.Root
				open={isToolbarOpen}
				onOpenChange={handleToggleToolbar}
			>
				<DropdownMenu.Trigger className="p-2 bg-primary hover:bg-primary/80 transition-all text-primary-foreground rounded-xl flex justify-between items-center gap-1">
					{t("admin.addNode")}
					<ChevronDown />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content className="rounded-xl flex flex-col bg-primary-foreground shadow p-1 gap-2">
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger className="rounded-xl cursor-default bg-accent hover:bg-accent/80 transition-all p-2 flex justify-between items-center">
							<Star />
							{t("admin.basic")}
							<ChevronRight />
						</DropdownMenu.SubTrigger>
						<DropdownMenu.Portal>
							<DropdownMenu.SubContent
								sideOffset={2}
								alignOffset={-5}
								className="rounded-xl bg-primary-foreground shadow-md flex flex-col gap-1.5 p-1 left-10 min-w-56 z-[999] "
							>
								<DropdownMenu.Item
									className="rounded-xl bg-accent hover:bg-gradient-to-r from-pink-100 to-red-300 cursor-pointer shadow p-1 px-2"
									onClick={() =>
										createNodeOnCenter("md", {
											source: "",
											editorContent: "",
										})
									}
								>
									<MenuText
										title={t("admin.content")}
										description={t("admin.writeContent")}
										icon={<Notebook />}
									/>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									className="rounded-xl bg-accent hover:bg-gradient-to-r from-sky-100 to-blue-300 cursor-pointer shadow p-1 px-2"
									onClick={() =>
										createNodeOnCenter("metadata", {
											source: "",
											editorContent: "",
										})
									}
								>
									<MenuText
										title={t("admin.metadata")}
										description={t("admin.writeMetadata")}
										icon={<FileText />}
									/>
								</DropdownMenu.Item>
							</DropdownMenu.SubContent>
						</DropdownMenu.Portal>
					</DropdownMenu.Sub>
					<span className="border-b border-gray-300" />
					<DropdownMenu.Label className="p-0.5 px-2  font-semibold italic text-foreground">
						{t("admin.advanced")}
					</DropdownMenu.Label>
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger className="rounded-xl cursor-default bg-accent  hover:bg-red-300 transition-all p-2 flex justify-between items-center">
							<Braces />
							{t("admin.content")}
							<ChevronRight />
						</DropdownMenu.SubTrigger>
						<DropdownMenu.Portal>
							<DropdownMenu.SubContent
								sideOffset={2}
								alignOffset={-5}
								className="rounded-xl bg-white shadow-md  flex flex-col gap-1.5 p-1 left-10 min-w-56 z-[999] "
							>
								<DropdownMenu.Item
									className="rounded-xl bg-accent hover:bg-gradient-to-r from-pink-100 to-red-300 cursor-pointer shadow p-1 px-2"
									onClick={() =>
										createNodeOnCenter("md", {
											source: "",
											editorContent: "",
										})
									}
								>
									<MenuText
										title={t("admin.content")}
										description={t("admin.writeContent")}
										icon={<Notebook />}
									/>
								</DropdownMenu.Item>
								<span className="border-b border-gray-300" />

								<DropdownMenu.Item
									className="rounded-xl bg-accent hover:bg-gradient-to-r from-yellow-100 to-amber-300 cursor-pointer shadow p-1 px-2"
									onClick={() =>
										createNodeOnCenter("blockly", {
											source: "",
											editorContent: "",
										})
									}
								>
									<MenuText
										title={t("admin.example")}
										description={t("admin.createExample")}
										icon={<Puzzle />}
									/>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									className="rounded-xl bg-accent hover:bg-gradient-to-r from-rose-200 to-red-300 cursor-pointer shadow p-1 px-2"
									onClick={() =>
										createNodeOnCenter("mdGen", {
											source: "",
											editorContent: "",
										})
									}
								>
									<MenuText
										title={t("admin.refineContent")}
										description={t("admin.generateContent")}
										icon={<Bot />}
									/>
								</DropdownMenu.Item>
							</DropdownMenu.SubContent>
						</DropdownMenu.Portal>
					</DropdownMenu.Sub>
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger className="rounded-xl cursor-default bg-accent hover:bg-blue-300 transition-all p-2 flex justify-between items-center">
							<FileText /> {t("admin.metadata")}
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
									className="rounded-xl bg-accent hover:bg-gradient-to-r from-sky-100 to-blue-300 shadow p-1 px-2"
									onClick={() =>
										createNodeOnCenter("metadata", {
											source: "",
											editorContent: "",
										})
									}
								>
									<MenuText
										title={t("admin.metadata")}
										description={t("admin.writeMetadata")}
										icon={<FileText />}
									/>
								</DropdownMenu.Item>
								<span className="border-b border-gray-300" />
								<DropdownMenu.Item
									className="rounded-xl bg-accent hover:bg-gradient-to-r from-red-100 to-blue-300 shadow p-1 px-2"
									onClick={() =>
										createNodeOnCenter("metadataGen", {
											source: "",
											editorContent: "",
										})
									}
								>
									<MenuText
										title={t("admin.refineMetadata")}
										description={t("admin.generateMetadata")}
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
