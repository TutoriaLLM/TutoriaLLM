import CodeInput from "@/components/common/Codeinput.js";
import type { workspaceNode } from "@/components/features/admin/TutorialEditor/nodes/nodetype";
import type { SessionValue } from "@/type.js";
import {
	Handle,
	type NodeProps,
	NodeToolbar,
	Position,
	useReactFlow,
} from "@xyflow/react";
import React, { useEffect } from "react";
import "blockly/javascript";
import { getSession } from "@/api/session.js";
import WorkspacePreview from "@/components/features/admin/workspacePreview.js";
import { ArrowBigDownIcon, Trash2 } from "lucide-react";

// Component to fetch Blockly code, display it, and generate output code
export function ExampleCode({ id, data }: NodeProps<workspaceNode>) {
	const { updateNodeData, deleteElements } = useReactFlow();

	const inputRef = React.useRef<HTMLInputElement>(null);

	const [session, setSession] = React.useState<SessionValue | null>(null);

	useEffect(() => {
		if (inputRef.current && data.sessionValue) {
			// inputRef.current.value = data.sessionValue.sessioncode;
			setSession(data.sessionValue);
			console.log("session", session);
		}
	}, [data.sessionValue]);

	const handleChangeSession = (field: string, value: SessionValue) => {
		updateNodeData(id, { ...data, [field]: value });
	};

	const handleDelete = () => {
		deleteElements({ nodes: [{ id: id }] });
	};

	const fetchCodeData = async () => {
		if (inputRef.current) {
			try {
				const data = await getSession({ key: inputRef.current.value });

				//容量が大きくなる可能性があるデータを削除
				if (data) data.audios = [];
				data.screenshot = "";
				data.dialogue = [];

				setSession(data);

				handleChangeSession("sessionValue", data);

				inputRef.current.value = "";
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		}
	};

	function onComplete() {
		fetchCodeData();
		if (session) handleChangeSession("sessionValue", session);
	}

	return (
		<div className="flex flex-col bg-gray-200 rounded-2xl overflow-clip cursor-auto">
			<span className="w-[40vh] h-4 bg-gray-300 custom-drag-handle cursor-move justify-center items-center flex gap-2">
				<span className="text-xs w-1 h-1 rounded-full bg-white" />
				<span className="text-xs w-1 h-1 rounded-full bg-white" />
				<span className="text-xs w-1 h-1 rounded-full bg-white" />
			</span>
			<NodeToolbar>
				<button type="button" className="text-red-500 " onClick={handleDelete}>
					<Trash2 className="drop-shadow" />
				</button>
			</NodeToolbar>

			<div className="text-wrap p-3 text-center">
				<div>Fetch External Blockly Code</div>
				<CodeInput onComplete={() => onComplete()} ref={inputRef} />

				<ArrowBigDownIcon className="w-full text-center h-10" />

				{data.sessionValue && (
					<div className="flex flex-col gap-2">
						<h3 className="text-xl">
							Fetched Workspace Data {data.sessionValue.sessioncode}:
						</h3>
						<WorkspacePreview session={data.sessionValue} />
					</div>
				)}
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
