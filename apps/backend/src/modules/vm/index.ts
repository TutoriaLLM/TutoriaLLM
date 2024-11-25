import { Worker } from "node:worker_threads";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "node:path";
import { fileURLToPath } from "node:url";
// import { sessionDB } from "../../../db/session.js";
import { db } from "../../db/index.js";
import type { vmMessage } from "./tsWorker.js";
import LogBuffer from "./logBuffer.js";
import i18next from "i18next";
import I18NexFsBackend, { type FsBackendOptions } from "i18next-fs-backend";
import type { Socket } from "socket.io";
import { appSessions } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { cors } from "hono/cors";
import { Hono } from "hono";
import { errorResponse } from "../../libs/errors/index.js";
import { serve } from "@hono/node-server";
import { getConfig } from "../config/index.js";
import type { SessionValue } from "../session/schema.js";
//debug
console.log("vm/index.js: Loading vm app");

//i18nの設定
i18next.use(I18NexFsBackend).init<FsBackendOptions>(
	{
		backend: {
			loadPath: "src/i18n/{{lng}}.json",
		},
		fallbackLng: "en",
		preload: [
			"en",
			"ja",
			"zh",
			"ms",
			"id",
			"ko",
			"es",
			"fr",
			"de",
			"it",
			"nl",
			"pl",
			"pt",
			"ru",
			"tr",
			"vi",
			"th",
			// "ar",
			// "he",
			"fa",
			"hi",
			"bn",
			"ta",
			"te",
		], // Add the languages you want to preload
	},
	(err, t) => {
		if (err) return console.error(err);
		console.log("i18next initialized");
	},
);
const { t } = i18next;

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

let vmPort = 3001;
if (process.env.VM_PORT) {
	const basePort = Number.parseInt(process.env.VM_PORT, 10); // 10進数として解釈
	if (!Number.isNaN(basePort)) {
		// basePortがNaNでないか確認
		vmPort = basePort;
	}
}

const app = new Hono();
app.use(cors());
//参加コードに対してプロキシを保存するマップ
// const vmProxies = new Map<string, any>();

// const proxy = createProxyMiddleware({
// 	router: async (req) => {
// 		const code = req.url?.split("/")[1];
// 		if (!code) {
// 			console.log("Invalid code");
// 			throw new Error("Invalid code");
// 		}
// 		const session = await db
// 			.select()
// 			.from(appSessions)
// 			.where(eq(appSessions.sessioncode, code));

// 		const uuid = session[0].uuid;
// 		const instance = vmInstances[uuid];
// 		if (instance) {
// 			console.log(
// 				"instance found on vm manager. proxying to: ",
// 				instance.ip,
// 				instance.port,
// 			);
// 			return `http://${instance.ip}:${instance.port}`;
// 		}
// 		// VMが見つからない場合は、undefined を返す
// 		// これにより、後続の処理で 404 を返すことができる
// 		console.log("VM not found");
// 		throw new Error("VM not found");
// 	},
// 	pathRewrite: (path, req) => {
// 		return path.replace(req.url?.split("/")[1] || "", "");
// 	},
// 	ws: true,
// 	logger: console,
// 	on: {
// 		close: (res, socket, head) => {
// 			console.log("vm manager close");
// 		},
// 		error: (err, req, res) => {
// 			console.log("vm manager error on proxy", err);
// 		},
// 		proxyReqWs: (proxyReq, req, socket, options, head) => {
// 			console.log("vm manager proxyReqWs");
// 		},
// 		proxyReq: (proxyReq, req, res) => {
// 			console.log("vm manager proxyReq");
// 		},
// 	},
// });
//Honoのミドルウェアを使用して、リクエストをプロキシする
//Honoは動的なプロキシが利用できる
app.all("/:code/*", async (c, next) => {
	const code = c.req.param("code");
	const session = await db.query.appSessions.findFirst({
		where: eq(appSessions.sessioncode, code),
	});
	if (!session) {
		return errorResponse(c, {
			message: "Invalid session",
			type: "NOT_FOUND",
		});
	}
	const uuid = session.uuid;
	const instance = vmInstances[uuid];
	if (instance) {
		console.log(
			"instance found on vm manager. proxying to: ",
			instance.ip,
			instance.port,
		);
		// return c.proxy(`http://${instance.ip}:${instance.port}`);
		return fetch(`http://${instance.ip}:${instance.port}`);
	}
	// VMが見つからない場合は、404 を返す
	return errorResponse(c, {
		message: "VM not found",
		type: "NOT_FOUND",
	});
});

serve({
	fetch: app.fetch,
	port: vmPort,
});

// // VMインスタンス作成時に新しいプロキシをリストに追加する関数
// function setupVMProxy(code: string, ip: string, port: number) {
// 	console.log("setting up proxy for", code, ip, port);
// 	vmProxies.set(code, proxy);
// 	console.log("new vmProxies", vmProxies);
// }
// // VMインスタンス停止時にプロキシを削除する関数
// function removeVMProxy(code: string) {
// 	vmProxies.delete(code);
// }
// 修正されたExecCodeTest関数
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
				codeRangeSizeMb: config.Code_Execution_Limits.Max_CodeRangeSizeMb,
				maxOldGenerationSizeMb:
					config.Code_Execution_Limits.Max_OldGenerationSizeMb,
				maxYoungGenerationSizeMb:
					config.Code_Execution_Limits.Max_YoungGenerationSizeMb,
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
				logBuffer.error(`${t("vm.outOfMemory")} (${err.message})`);
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
