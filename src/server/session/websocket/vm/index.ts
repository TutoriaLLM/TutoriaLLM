import { Worker } from "node:worker_threads";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
//import nodeHttpProxy from "http-proxy";
//import proxy from "express-http-proxy";
import { WebSocketServer, type WebSocket } from "ws";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { SessionValue, Dialogue, ContentType } from "../../../../type.js";
import { sessionDB } from "../../../db/session.js";
import type { vmMessage } from "./tsWorker.js";
import LogBuffer from "./logBuffer.js";
import cors from "cors";
import { request } from "node:http";
import { vmApp, vmServer } from "../../../main.js";

//debug
console.log("vm/index.js: Loading vm app");

// `__dirname` を取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// VMのインスタンスを管理するインターフェース
interface VMInstance {
	running: boolean;
}

const vmExpress = vmApp;

// Expressアプリケーションを作成し、WebSocketサーバーを設定

const vmInstances: { [key: string]: VMInstance } = {};

export async function ExecCodeTest(
	code: string,
	uuid: string,
	userScript: string,
	serverRootPath: string,
	clients: Map<string, any>,
	DBupdator: (
		code: string,
		newData: SessionValue,
		clients: Map<string, any>,
	) => Promise<void>,
): Promise<string> {
	const session = await sessionDB.get(code);
	if (!session) {
		return "Invalid session";
	}
	const sessionValue: SessionValue = JSON.parse(session);
	if (sessionValue.uuid !== uuid) {
		return "Invalid uuid";
	}

	const logBuffer = new LogBuffer(
		async (code, logs) => {
			const session = await sessionDB.get(code);
			if (!session) {
				return;
			}
			const sessionValue: SessionValue = JSON.parse(session);
			sessionValue.dialogue.push(logs);
			await DBupdator(code, sessionValue, clients);
		},
		code,
		async () => {
			const session = await sessionDB.get(code);
			return session ? JSON.parse(session) : null;
		},
	);

	try {
		const worker = new Worker(path.resolve(__dirname, "./worker.mjs"), {
			workerData: { code, uuid, serverRootPath, userScript },
			resourceLimits: {
				codeRangeSizeMb: 128,
				maxOldGenerationSizeMb: 128,
				maxYoungGenerationSizeMb: 32,
			},
		});

		worker.on("message", (msg: vmMessage) => {
			if (msg.type === "log") logBuffer.add(msg.content);
			if (msg.type === "error") logBuffer.add(msg.content);

			if (msg.type === "openVM") {
				console.log("VM server received on port", msg.port);

				const port = msg.port;
				if (!port) {
					return;
				}

				const proxy = createProxyMiddleware({
					target: `http://localhost:${port}`,
					changeOrigin: true,
					ws: true,
					logger: console,
					on: {
						error: (err, req, res) => {
							console.log("error on proxy", err);
						},
						proxyReqWs: (proxyReq, req, socket, options, head) => {
							console.log("proxyReqWs");
						},
					},
				});

				// HTTPとWebSocketの両方のプロキシを設定
				vmExpress.use((req, res, next) => {
					if (req.originalUrl.includes(`/${code}`)) {
						proxy(req, res, next);
					} else {
						next();
					}
				});
			}
		});

		worker.on("exit", (exitcode) => {
			console.log(`Worker stopped with exit code ${exitcode}`);
			logBuffer.stop();
			StopCodeTest(code, uuid);
		});
	} catch (e) {
		console.log("error on VM execution");
		console.log(e);
		await StopCodeTest(code, uuid);
	}

	vmInstances[uuid] = { running: true };

	logBuffer.start();

	return "Valid uuid";
}

export async function StopCodeTest(
	code: string,
	uuid: string,
): Promise<{ message: string; error: string }> {
	const instance = vmInstances[uuid];
	if (instance?.running) {
		instance.running = false;
		const session = await sessionDB.get(code);
		if (!session) {
			return {
				message: "Invalid session",
				error: "Invalid session",
			};
		}
		if (JSON.parse(session).uuid !== uuid) {
			return {
				message: "Invalid uuid",
				error: "Invalid uuid",
			};
		}
		console.log("updating session result");
		delete vmInstances[uuid];

		const stack = vmExpress._router.stack;
		for (let i = stack.length - 1; i >= 0; i--) {
			const layer = stack[i];
			if (layer.route?.path?.toString().includes(code)) {
				stack.splice(i, 1);
			}
		}
		return {
			message: "Script execution stopped successfully.",
			error: "",
		};
	}
	return {
		message: "Script is not running.",
		error: "Script is not running.",
	};
}
