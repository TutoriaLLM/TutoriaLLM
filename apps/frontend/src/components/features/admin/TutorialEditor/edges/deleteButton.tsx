//custom edge with delete button
import {
	BaseEdge,
	EdgeLabelRenderer,
	getBezierPath,
	useReactFlow,
	type EdgeProps,
} from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

export function DeleteButton({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style = {},
	markerEnd,
}: EdgeProps) {
	const { setEdges } = useReactFlow();
	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	const onEdgeClick = () => {
		setEdges((edges) => edges.filter((edge) => edge.id !== id));
	};

	return (
		<>
			<BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
			<EdgeLabelRenderer>
				<div
					className="absolute pointer-events-auto origin-center nodrag nopan"
					style={{
						transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
					}}
				>
					<Button variant="outline" size="icon" onClick={onEdgeClick}>
						<XIcon />
					</Button>
				</div>
			</EdgeLabelRenderer>
		</>
	);
}
