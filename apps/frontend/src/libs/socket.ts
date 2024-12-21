import { io } from "socket.io-client";

export function getSocket(sessionCode: string, uuid: string) {
	const socket = io(VITE_BACKEND_URL, {
		path: "/session/socket/connect",
		query: {
			code: sessionCode,
			uuid: uuid,
		},
	});
	return socket;
}
