import { toSocketIo } from "@mswjs/socket.io-binding";
import { ws } from "msw";

const chat = ws.link("ws://localhost:3001");

export const handlers = [
	chat.addEventListener("connection", (connection) => {
		const io = toSocketIo(connection);

		io.client.on("connect", () => {
			io.client.emit("message", "Connected to the server!");
			console.info("Connected to the server!");
		});
	}),
];
