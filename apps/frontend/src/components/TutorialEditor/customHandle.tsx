import { Handle, type HandleProps, useHandleConnections } from "@xyflow/react";

interface CustomHandleProps extends HandleProps {
	connectionCount: number;
}

const CustomHandle = ({ connectionCount, ...props }: CustomHandleProps) => {
	const connections = useHandleConnections({
		id: props.id,
		type: props.type,
	});

	return (
		<Handle {...props} isConnectable={connections.length < connectionCount}>
			{props.children}
		</Handle>
	);
};

export default CustomHandle;
