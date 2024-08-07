import vm from "node:vm";
import path from "node:path";
import http, { createServer } from "node:http";
import { workerData, parentPort } from "node:worker_threads";
import { ExtensionLoader } from "../extentionLoader.js";
import { fileURLToPath } from "node:url";
import { WebSocketServer, WebSocket } from "ws";
import getPort from "get-port";

const { code, uuid, serverRootPath, userScript } = workerData;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!parentPort) {
	throw new Error("parentPort is not defined");
}

export type vmMessage = {
	type: "log" | "error" | "openVM";
	content: string;
	port?: number;
};

const server = createServer((req, res) => {
	// CORSヘッダーを追加
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

	if (req.method === "OPTIONS") {
		res.writeHead(204);
		res.end();
		return;
	}

	res.writeHead(200, { "Content-Type": "text/plain" });
	res.end(`Hello, world from VM server!: ${code}`);
});

const context = vm.createContext({
	code,
	uuid,
	console: {
		log: (...args: string[]) => {
			const logMessage = args.join(" ");
			console.log(`log from VM: ${logMessage}`);
			parentPort?.postMessage({
				type: "log",
				content: logMessage,
			} as vmMessage);
		},
		error: (...args: string[]) => {
			const logMessage = args.join(" ");
			console.error(`error from VM: ${logMessage}`);
			parentPort?.postMessage({
				type: "error",
				content: logMessage,
			} as vmMessage);
		},
	},
	http,
	serverRootPath,
	WebSocket,
});

const port = await getPort();

server.listen(port, async () => {
	console.log(`Server is listening with port: ${port}`);
	parentPort?.postMessage({
		type: "openVM",
		port,
	} as vmMessage);
});

// WebSocketサーバーの作成
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
	console.log("WebSocket connection established");

	ws.on("message", (message) => {
		const logMessage = message.toString();
		console.log(`message from WebSocket: ${logMessage}`);
		ws.send(`message received: ${logMessage}`);
		parentPort?.postMessage({
			type: "log",
			content: logMessage,
		} as vmMessage);

		// 受信したメッセージをVM内のスクリプトに渡す処理を追加する場合、ここにそのロジックを追加します
		// context に WebSocket インスタンスを追加して、VM内で直接使用できるようにすることも可能です
	});

	ws.on("close", () => {
		console.log("WebSocket connection closed");
	});

	ws.on("error", (error) => {
		console.error(`WebSocket error: ${error.message}`);
		parentPort?.postMessage({
			type: "error",
			content: `WebSocket error: ${error.message}`,
		} as vmMessage);
	});
});

const extensionsDir = path.resolve(__dirname, "../../../../extensions");
const extensionLoader = new ExtensionLoader(extensionsDir);
await extensionLoader.loadExtensions(context);
const extScript = await extensionLoader.loadScript();

const script = new vm.Script(`
  ${userScript}
`);

script.runInContext(context);
