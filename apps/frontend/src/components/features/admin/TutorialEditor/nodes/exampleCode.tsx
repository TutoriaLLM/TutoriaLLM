import type { workspaceNode } from "@/components/features/admin/TutorialEditor/nodes/nodetype";
import type { SessionValue } from "@/type.js";
import {
	Handle,
	type NodeProps,
	NodeToolbar,
	Position,
	useReactFlow,
} from "@xyflow/react";
import { useEffect, useState } from "react";
import "blockly/javascript";
import { PanelRightClose, Trash2 } from "lucide-react";
import { useAtom, useSetAtom } from "jotai";
import { currentSessionState, prevSessionState } from "@/state";
import Editor from "@/components/common/Blockly";
import i18next from "i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/libs/utils";

export function ExampleCode({ id, data }: NodeProps<workspaceNode>) {
	const { updateNodeData, deleteElements } = useReactFlow();

	const [isToolboxOpen, setIsToolboxOpen] = useState(true);
	const [currentSession, setCurrentSession] = useAtom(currentSessionState);
	const setPrevSession = useSetAtom(prevSessionState);

	useEffect(() => {
		const initialData = {
			uuid: "",
			sessionId: "",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			dialogue: null,
			quickReplies: null,
			isReplying: false,
			easyMode: false,
			responseMode: "text",
			workspace: {},
			isVMRunning: false,
			clients: [],
			language: "en",
			llmContext: "",
			tutorial: {
				isTutorial: false,
				tutorialId: null,
				progress: 10,
			},
			stats: {
				totalConnectingTime: 0,
				currentNumOfBlocks: 0,
				totalInvokedLLM: 0,
				totalUserMessages: 0,
				totalCodeExecutions: 0,
			},
			audios: [],
			userAudio: "",
			screenshot: "",
			clicks: [],
			userInfo: "",
		} satisfies SessionValue;

		setCurrentSession(initialData);
		setPrevSession(initialData);
	}, [setCurrentSession, setPrevSession]);

	useEffect(() => {
		if (currentSession) {
			handleChangeSession("sessionValue", currentSession);
		}
	}, [currentSession]);

	const handleChangeSession = (field: string, value: SessionValue) => {
		updateNodeData(id, { ...data, [field]: value });
	};

	const handleDelete = () => {
		deleteElements({ nodes: [{ id: id }] });
	};

	function handleToggle() {
		setIsToolboxOpen((prev) => !prev);
	}

	return (
		<div className="bg-gray-200 rounded-2xl overflow-clip cursor-auto">
			<div>
				<span className="w-full h-4 bg-gray-300 custom-drag-handle cursor-move flex justify-center items-center gap-2">
					<span className="text-xs w-1 h-1 rounded-full bg-white" />
					<span className="text-xs w-1 h-1 rounded-full bg-white" />
					<span className="text-xs w-1 h-1 rounded-full bg-white" />
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

				<div className="flex flex-col gap-2 p-2">
					<Button
						onClick={handleToggle}
						size="icon"
						className={cn(
							"top-2 left-4 flex items-center justify-center transition-transform",
							{ "rotate-180": isToolboxOpen },
						)}
					>
						<PanelRightClose />
					</Button>
				</div>
			</div>

			<div id="workspaceArea" className="no-wheel w-[700px] h-[500px]">
				<Editor menuOpen={isToolboxOpen} language={i18next.language ?? "en"} />
			</div>

			<Handle
				type="source"
				position={Position.Right}
				style={{ background: "orange", padding: 5, zIndex: 1000 }}
				isValidConnection={(connection) =>
					connection.targetHandle === "blockly"
				}
			/>
		</div>
	);
}
