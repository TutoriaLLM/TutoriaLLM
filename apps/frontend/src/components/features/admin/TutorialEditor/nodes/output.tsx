import CustomHandle from "@/components/features/admin/TutorialEditor/customHandle";
import type {
	markdownNode,
	metadataNode,
} from "@/components/features/admin/TutorialEditor/nodes/nodetype";
import { Position, useHandleConnections, useNodesData } from "@xyflow/react";
import Markdown from "react-markdown";

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
		<div className="w-full h-full flex flex-col rounded-2xl">
			<style>
				{`
					.react-flow__node-output {
						background-color: hsl(var(--background));
						width: 100%;
						max-width: 24rem;
						display: flex;
						border: 1px solid #e1e8ed;
						border-radius: 0.5rem;
						padding: 1rem;
				}
				`}
			</style>
			<div className="flex-col flex break-words whitespace-pre-wrap">
				<div className="text-left">
					<CustomHandle
						id="metadata"
						type="target"
						position={Position.Left}
						style={{ top: 10, background: "blue", padding: 5, zIndex: 1000 }}
						connectionCount={1}
					/>
					<h3 className=" text-lg font-semibold">Metadata:</h3>
					{metadataNodesData.map((node) => (
						<div
							key={node.id}
							className="bg-card text-card-foreground p-2 rounded-md flex flex-col gap-2"
						>
							<p className="flex flex-wrap">
								<strong className="text-card-foreground">Title:</strong>{" "}
								{node.data.title}
							</p>
							<p className="flex flex-wrap">
								<strong className="text-card-foreground">Description:</strong>{" "}
								{node.data.description}
							</p>
							<p className="flex flex-wrap">
								<strong className="text-card-foreground">Tags:</strong>{" "}
								{node.data.tags.join(", ")}
							</p>
							<p className="flex flex-wrap">
								<strong className="text-card-foreground">Language:</strong>{" "}
								{node.data.language}
							</p>
						</div>
					))}
				</div>
				<div className="text-left no-wheel">
					<CustomHandle
						id="markdown"
						type="target"
						position={Position.Left}
						style={{ bottom: 10, background: "red", padding: 5, zIndex: 1000 }}
						connectionCount={1}
					/>
					<h3 className=" text-lg font-semibold">Markdown:</h3>
					{markdownNodesData.map((node) => (
						<div key={node.id} className="bg-card p-2 rounded-md">
							<div id={`content-${node.id}`} className="p-1">
								<pre className="whitespace-pre-wrap break-words text-card-foreground h-full max-h-80 cursor-text nowheel prose-sm noscroll select-text overflow-y-auto p-2">
									<Markdown>{node.data.source}</Markdown>
								</pre>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
