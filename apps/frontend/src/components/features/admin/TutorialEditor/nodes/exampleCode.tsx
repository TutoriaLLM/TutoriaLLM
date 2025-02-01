import type { workspaceNode } from "@/components/features/admin/TutorialEditor/nodes/nodetype";
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
import { BlocklyEditor } from "@/components/common/Blockly";
import { Button } from "@/components/ui/button";
import { cn } from "@/libs/utils";
import i18next from "i18next";

export function ExampleCode({ id, data }: NodeProps<workspaceNode>) {
	const { updateNodeData, deleteElements } = useReactFlow();

	const [isToolboxOpen, setIsToolboxOpen] = useState(true);

	const [session, setSession] = useState<object | null>(data.workspace);

	const handleChangeSession = (
		field: string,
		value: {
			[x: string]: any;
		},
	) => {
		updateNodeData(id, { ...data, [field]: value });
	};

	useEffect(() => {
		if (session) handleChangeSession("workspace", session);
	}, [session]);

	const handleDelete = () => {
		deleteElements({ nodes: [{ id: id }] });
	};

	function handleToggle() {
		setIsToolboxOpen((prev) => !prev);
	}

	return (
		<div className="bg-background rounded-2xl overflow-clip cursor-auto">
			<div>
				<span className="w-full h-4 bg-border custom-drag-handle cursor-move flex justify-center items-center gap-2">
					<span className="text-xs w-1 h-1 rounded-full bg-accent-foreground" />
					<span className="text-xs w-1 h-1 rounded-full bg-accent-foreground" />
					<span className="text-xs w-1 h-1 rounded-full bg-accent-foreground" />
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
				<BlocklyEditor
					workspaceJson={session || undefined}
					setWorkspaceJson={(workspace) => setSession(workspace)}
					isMenuOpen={isToolboxOpen}
					language={i18next.language}
				/>
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
