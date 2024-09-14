import {
	Position,
	type NodeProps,
	Handle,
	useReactFlow,
	type Node,
} from "@xyflow/react";
import type { metadataNode } from "./nodetype.js";

export function Metadata({ id, data }: NodeProps<metadataNode>) {
	const { updateNodeData } = useReactFlow();

	const handleChange = (field: string, value: string) => {
		updateNodeData(id, { ...data, [field]: value });
	};

	return (
		<div
			style={{
				background: "#eee",
				color: "#222",
				padding: 10,
				fontSize: 12,
				borderRadius: 10,
			}}
		>
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
