import { Worker } from "node:worker_threads";
import path from "node:path";
import { fileURLToPath } from "node:url";
// import { sessionDB } from "../../../db/session.js";
import { db } from "@/db";
import type { vmMessage } from "@/modules/vm/tsWorker";
import LogBuffer from "@/modules/vm/logBuffer";
import type { Socket } from "socket.io";
import { appSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { errorResponse } from "@/libs/errors";
import { type HttpBindings, serve } from "@hono/node-server";
import { getConfig } from "@/modules/config";
import type { SessionValue } from "@/modules/session/schema";
import { createProxyMiddleware } from "http-proxy-middleware";
// `__dirname` を取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// VMのインスタンスを管理するインターフェース
interface VMInstance {
	running: boolean;
	worker: Worker;
	port?: number;
	ip?: string;
}

// VMのインスタンスを管理するオブジェクト
const vmInstances: { [key: string]: VMInstance } = {};

let vmPort = 3002;
if (process.env.VM_PORT) {
	const basePort = Number.parseInt(process.env.VM_PORT, 10); // 10進数として解釈
	if (!Number.isNaN(basePort)) {
		// basePortがNaNでないか確認
		vmPort = basePort;
	}
}

const app = new Hono<{ Bindings: HttpBindings }>();
//参加コードに対してプロキシを保存するマップ
const proxy = createProxyMiddleware({
	router: async (req) => {
		const code = req.url?.split("/")[1];
		if (!code) {
			console.log("Invalid code");
			throw new Error("Invalid code");
		}
		const session = await db
			.select()
			.from(appSessions)
			.where(eq(appSessions.sessioncode, code));

		const uuid = session[0].uuid;
		const instance = vmInstances[uuid];
		if (instance) {
			console.log(
				"instance found on vm manager. proxying to: ",
				instance.ip,
				instance.port,
			);
			return `http://${instance.ip}:${instance.port}`;
		}
		// VMが見つからない場合は、undefined を返す
		// これにより、後続の処理で 404 を返すことができる
		console.log("VM not found");
		throw new Error("VM not found");
	},
	pathRewrite: (path, req) => {
		return path.replace(req.url?.split("/")[1] || "", "");
	},
	ws: true,
	logger: console,
	on: {
		close: (res, socket, head) => {
			console.log("vm manager close");
		},
		error: (err, req, res) => {
			console.log("vm manager error on proxy", err);
		},
		proxyReqWs: (proxyReq, req, socket, options, head) => {
			console.log("vm manager proxyReqWs");
		},
		proxyReq: (proxyReq, req, res) => {
			console.log("vm manager proxyReq");
		},
	},
});

app.use("*", (c, next) => {
	return new Promise((resolve, reject) => {
		proxy(c.env.incoming, c.env.outgoing, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
});

serve({
	fetch: app.fetch,
	port: vmPort,
});

export async function ExecCodeTest(
	code: string,
	uuid: string,
	userScript: string,
	serverRootPath: string,
	socket: Socket,
	DBupdator: (
		code: string,
		newData: SessionValue,
		socket: Socket,
	) => Promise<void>,
): Promise<string> {
	const session = await db
		.select()
		.from(appSessions)
		.where(eq(appSessions.sessioncode, code));
	if (!session) {
		return "Invalid session";
	}
	const sessionValue: SessionValue = session[0];
	if (sessionValue.uuid !== uuid) {
		return "Invalid uuid";
	}

	const logBuffer = new LogBuffer(
		async (code, logs) => {
			const session = await db
				.select()
				.from(appSessions)
				.where(eq(appSessions.sessioncode, code));
			if (!session) {
				return;
			}
			const sessionValue: SessionValue = session[0];
			sessionValue.dialogue?.push(logs);
			await DBupdator(code, sessionValue, socket);
		},
		code,
		async () => {
			const session = await db
				.select()
				.from(appSessions)
				.where(eq(appSessions.sessioncode, code));
			return session[0];
		},
	);

	try {
		//configを読み込む
		const config = getConfig();

		const joinCode = code;

		const worker = new Worker(path.resolve(__dirname, "./worker.mjs"), {
			workerData: { joinCode, sessionValue, serverRootPath, userScript },
			resourceLimits: {
				// codeRangeSizeMb: config.Code_Execution_Limits.Max_CodeRangeSizeMb,
				// maxOldGenerationSizeMb:
				// 	config.Code_Execution_Limits.Max_OldGenerationSizeMb,
				// maxYoungGenerationSizeMb:
				// 	config.Code_Execution_Limits.Max_YoungGenerationSizeMb,
			},
		});
		console.log("resourceLimits", worker.resourceLimits);

		worker.on("message", (msg: vmMessage) => {
			if (msg.type === "log") logBuffer.add(msg.content);
			if (msg.type === "error") logBuffer.error(msg.content);
			if (msg.type === "info") logBuffer.info(msg.content);

			if (msg.type === "openVM") {
				console.log("VM server received on port", msg.port);

				const port = msg.port;
				const ip = msg.ip;
				if (!port) {
					return;
				}

				// vmInstancesにIPとポートを保存
				vmInstances[uuid].port = port;
				vmInstances[uuid].ip = ip;

				// プロキシの設定
				// setupVMProxy(code, ip, port);
			}
		});

		worker.on("error", (err) => {
			if (err.toString().includes("ERR_WORKER_OUT_OF_MEMORY")) {
				logBuffer.error(`${"vm.outOfMemory"} (${err.message})`);
			} else {
				logBuffer.error(`${err.message}`);
			}
			console.log("Worker error:", err);
		});

		worker.on("exit", (exitcode) => {
			console.log(`Worker stopped with exit code ${exitcode}`);
			logBuffer.stop();
			StopCodeTest(code, uuid, socket, DBupdator);
		});

		// workerインスタンスを保存
		vmInstances[uuid] = { running: true, worker: worker };
	} catch (e) {
		console.log("error on VM execution");
		console.log(e);
		await StopCodeTest(code, uuid, socket, DBupdator);
	}

	logBuffer.start();

	return "Valid uuid";
}

// ExecCodeTestで実行しているWorkerを通して、コードを更新するための関数
export async function UpdateCodeTest(
	code: string,
	uuid: string,
	newUserScript: string,
): Promise<string> {
	const instance = vmInstances[uuid];
	if (instance?.running) {
		const session = await db
			.select()
			.from(appSessions)
			.where(eq(appSessions.sessioncode, code));
		if (!session) {
			return "Invalid session";
		}
		const sessionValue: SessionValue = session[0];
		if (sessionValue.uuid !== uuid) {
			return "Invalid uuid";
		}
		// Workerに新しいコードを送信
		instance.worker.postMessage({
			type: "updateScript",
			code: newUserScript,
		});
		return "Script updated successfully.";
	}
	return "Script is not running.";
}

// 修正されたStopCodeTest関数
export async function StopCodeTest(
	code: string,
	uuid: string,
	socket: Socket,
	DBupdator: (
		code: string,
		newData: SessionValue,
		socket: Socket,
	) => Promise<void>,
): Promise<{ message: string; error: string }> {
	const instance = vmInstances[uuid];
	if (instance?.running) {
		instance.running = false;
		const session = await db
			.select()
			.from(appSessions)
			.where(eq(appSessions.sessioncode, code));
		if (!session) {
			return {
				message: "Invalid session",
				error: "Invalid session",
			};
		}
		if (session[0].uuid !== uuid) {
			return {
				message: "Invalid uuid",
				error: "Invalid uuid",
			};
		}
		console.log("updating session result");

		// Workerを終了
		await instance.worker.terminate();

		// プロキシをクリア
		// const stack = vmExpress._router.stack;
		// for (let i = stack.length - 1; i >= 0; i--) {
		// 	const layer = stack[i];
		// 	if (layer.route?.path?.toString().includes(code)) {
		// 		stack.splice(i, 1);
		// 	}
		// }

		// プロキシを削除
		// removeVMProxy(code);
		delete vmInstances[uuid];

		// DBを更新し、クライアントに通知
		const sessionValue: SessionValue = session[0];
		sessionValue.isVMRunning = false;
		await DBupdator(code, sessionValue, socket);
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
