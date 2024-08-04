import vm from "node:vm";
import path from "node:path";
import http, { createServer } from "node:http";
import { workerData, parentPort } from "node:worker_threads";
import { ExtensionLoader } from "../extentionLoader.js";
import { fileURLToPath } from "node:url";
import expressWs from "express-ws";
import Websocket, { WebSocketServer } from "ws";
import express from "express";
import getPort from "get-port";
import exp from "node:constants";

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

// const app = expressWs(express()).app;

// // 新しいルートを設定
// app.get("/", (req, res) => {
// 	res.send("Hello, world!");
// });

// app.ws("/", (ws, req) => {
// 	ws.send("Hello, world!");
// });

//エラーが起きるので、Expressの代わりにhttp / wsを使う
const server = createServer();
const wss = new WebSocketServer({ noServer: true });
wss.on("connection", (ws) => {
	console.log("connected on vm worker");
	ws.on("message", (message) => {
		console.log(`received: ${message}`);
	});
	ws.send("Hello, world!");
});
//hello world http
server.on("request", (req, res) => {
	res.writeHead(200, { "Content-Type": "text/plain" });
	res.end("Hello, world!");
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
});
const port = await getPort();

server.on("upgrade", function upgrade(request, socket, head) {
	wss.handleUpgrade(request, socket, head, function done(ws) {
		wss.emit("connection", ws, request);
	});
});
// app.listen(port, async () => {
// 	console.log(`Server is listening with port: ${port}`);
// 	parentPort?.postMessage({
// 		type: "openVM",
// 		port,
// 	} as vmMessage);
// });
server.listen(port, async () => {
	console.log(`Server is listening with port: ${port}`);
	parentPort?.postMessage({
		type: "openVM",
		port,
	} as vmMessage);
});

const extensionsDir = path.resolve(__dirname, "../../../../extensions");
const extensionLoader = new ExtensionLoader(extensionsDir);
await extensionLoader.loadExtensions(context);
const extScript = await extensionLoader.loadScript();

const script = new vm.Script(`
  ${userScript}
`);

script.runInContext(context);
