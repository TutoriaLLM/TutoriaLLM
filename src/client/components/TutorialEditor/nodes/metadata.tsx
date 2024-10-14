import {
	Position,
	type NodeProps,
	Handle,
	useReactFlow,
	type Node,
	NodeToolbar,
} from "@xyflow/react";
import type { metadataNode } from "./nodetype.js";
import { Trash2 } from "lucide-react";

export function Metadata({ id, data }: NodeProps<metadataNode>) {
	const { updateNodeData, deleteElements } = useReactFlow();

	const handleChange = (field: string, value: string) => {
		updateNodeData(id, { ...data, [field]: value });
	};

	const handleDelete = () => {
		deleteElements({ nodes: [{ id: id }] });
	};

	return (
		<div className="w-64 bg-gray-200 rounded-2xl overflow-clip">
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
			<div className="p-2">
				<div>Metadata</div>
				<div style={{ marginTop: 5 }}>
					<label>
						Title:
						<input
							onChange={(evt) => handleChange("title", evt.target.value)}
							value={data.title || ""}
							style={{ display: "block", width: "100%", marginBottom: 5 }}
						/>
					</label>
					<label>
						Description:
						<textarea
							onChange={(evt) => handleChange("description", evt.target.value)}
							value={data.description || ""}
							style={{ display: "block", width: "100%", marginBottom: 5 }}
						/>
					</label>
					<label>
						Keywords:
						<input
							onChange={(evt) => handleChange("keywords", evt.target.value)}
							value={data.keywords || ""}
							style={{ display: "block", width: "100%" }}
						/>
					</label>
				</div>
			</div>

			<Handle
				type="source"
				position={Position.Right}
				style={{ background: "blue", padding: 5, zIndex: 1000 }}
				isValidConnection={(connection) =>
					connection.targetHandle === "metadata"
				}
			/>
		</div>
	);
}
