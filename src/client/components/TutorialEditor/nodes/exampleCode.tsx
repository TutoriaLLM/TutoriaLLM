import {
	Position,
	type NodeProps,
	Handle,
	useReactFlow,
	type Node,
} from "@xyflow/react";
import type { workspaceNode } from "./nodetype.js";
import CodeInput from "../../ui/Codeinput.js";
import type { SessionValue } from "../../../../type.js";
import React, { useEffect } from "react";
import * as Blockly from "blockly";
import "blockly/javascript";
import WorkspacePreview from "../../ui/workspacePreview.js";
import { set } from "zod";
import { use } from "i18next";
import { ArrowBigDownIcon } from "lucide-react";

// Component to fetch Blockly code, display it, and generate output code
export function ExampleCode({ id, data }: NodeProps<workspaceNode>) {
	const { updateNodeData } = useReactFlow();

	const inputRef = React.useRef<HTMLInputElement>(null);

	const [session, setSession] = React.useState<SessionValue | null>(null);

	useEffect(() => {
		if (inputRef.current && data.sessionValue) {
			inputRef.current.value = data.sessionValue.sessioncode;
			setSession(data.sessionValue);
			console.log("session", session);
		}
	}, [data.sessionValue]);

	const handleChangeSession = (field: string, value: SessionValue) => {
		updateNodeData(id, { ...data, [field]: value });
	};

	const fetchCodeData = async () => {
		if (inputRef.current) {
			try {
				const response = await fetch(`/api/session/${inputRef.current.value}`);
				if (!response.ok) {
					if (response.status === 404) {
						alert("Session not found");
					}
					inputRef.current.value = "";
					return;
				}
				const data: SessionValue = await response.json();

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
