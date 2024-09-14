import {
	Handle,
	Position,
	useHandleConnections,
	useNodesData,
} from "@xyflow/react";
import {
	isTextNode,
	type markdownNode,
	type metadataNode,
	type MyNode,
} from "./nodetype.js";

export default function Output() {
	const metadataConnections = useHandleConnections({
		type: "target",
		id: "metadata",
	});
	const markdownConnections = useHandleConnections({
		type: "target",
		id: "markdown",
	});

	const metadataNodeIds = metadataConnections.map(
		(connection) => connection.source,
	);
	const markdownNodeIds = markdownConnections.map(
		(connection) => connection.source,
	);

	const metadataNodesData = useNodesData<metadataNode>(metadataNodeIds);
	const markdownNodesData = useNodesData<markdownNode>(markdownNodeIds);

	return (
		<div className="w-full h-full flex flex-col">
			<div className="flex-col flex break-words whitespace-pre-wrap">
				<div className="text-left">
					<Handle
						id="metadata"
						type="target"
						position={Position.Left}
						style={{ top: 10, background: "blue", padding: 5, zIndex: 1000 }}
					/>
					<h3 className=" text-lg font-semibold">Metadata:</h3>
					{metadataNodesData.map((node) => (
						<div key={node.id} className="bg-gray-200 p-2 rounded-md ">
							<p className="flex">
								<strong>Title:</strong> {node.data.title}
							</p>
							<p className="flex">
								<strong>Description:</strong> {node.data.description}
							</p>
							<p className="flex">
								<strong>Keywords:</strong> {node.data.keywords}
							</p>
						</div>
					))}
				</div>
				<div className="text-left">
					<Handle
						id="markdown"
						type="target"
						position={Position.Left}
						style={{ bottom: 10, background: "red", padding: 5, zIndex: 1000 }}
					/>
					<h3 className=" text-lg font-semibold">Markdown:</h3>
					{markdownNodesData.map((node) => (
						<div key={node.id}>
							<pre className="bg-gray-200 p-2 rounded-md">
								{node.data.source}
							</pre>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
