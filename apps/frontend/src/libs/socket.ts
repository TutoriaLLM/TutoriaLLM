import { io } from "socket.io-client";

export function getSocket(uuid: string) {
	const socket = io(VITE_BACKEND_URL, {
		path: "/session/socket/connect",
		query: {
			uuid: uuid,
		},
	});
	return socket;
}
