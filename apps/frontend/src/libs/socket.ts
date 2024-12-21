import { io } from "socket.io-client";

const host = import.meta.env.BACKEND_URL;

export function getSocket(sessionCode: string, uuid: string) {
	const socket = io(host, {
		path: "/session/socket/connect",
		query: {
			code: sessionCode,
			uuid: uuid,
		},
	});
	return socket;
}
