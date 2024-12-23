import { io } from "socket.io-client";

export function getSocket(sessionId: string) {
	const socket = io(VITE_BACKEND_URL, {
		path: "/session/socket/connect",
		query: {
			sessionId: sessionId,
		},
	});
	return socket;
}
