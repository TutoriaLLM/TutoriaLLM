import fs from "node:fs";
import * as http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm, { type Context, type Script } from "node:vm";
import type {
	SessionValue,
	WSMessage,
	Dialogue,
	ContentType,
} from "../../../../type.js";
import { sessionDB } from "../../../db/session.js";
import { ExtensionLoader } from "../extentionLoader.js";
// `__dirname` を取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// VMのインスタンスを管理するためのインターフェース
interface VMInstance {
	context: Context;
	script: Script | null;
	running: boolean;
}

// VMのインスタンスを管理するオブジェクト
const vmInstances: { [key: string]: VMInstance } = {};

// ログを蓄積するバッファと定期的なDB更新関数
class LogBuffer {
	private buffer: string[] = [];
	private interval: NodeJS.Timeout | null = null;

	constructor(
		private dbUpdater: (code: string, logs: Dialogue) => Promise<void>,
		private code: string,
		private getSessionValue: () => Promise<SessionValue | null>,
	) {}

	start() {
		if (this.interval) return;
		this.interval = setInterval(() => this.flush(), 1000);
	}

	stop() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}

	add(log: string) {
		this.buffer.push(log);
	}

	private async flush() {
		if (this.buffer.length === 0) return;
		const sessionValue = await this.getSessionValue();
		if (!sessionValue) return;

		const logsToSave: Dialogue = {
			id: sessionValue.dialogue.length + 1, // グループのIDを設定
			contentType: "group_log",
			isuser: false,
			content: this.buffer.map((log, index) => ({
				id: index + 1,
				contentType: "log" as ContentType,
				isuser: false,
				content: log,
			})),
		};
		this.buffer = [];
		try {
			await this.dbUpdater(this.code, logsToSave);
		} catch (e) {
			console.error("Error updating DB with logs:", e);
		}
	}
}

//コンテキストでサーバーを作成するのに使用
import express, { type Router } from "express";
import expressWs from "express-ws";

export const vmExpress = express.Router();
expressWs(vmExpress as any);

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
	// verify session with uuid
	const session = await sessionDB.get(code);
	if (!session) {
		return "Invalid session";
	}
	const sessionValue: SessionValue = JSON.parse(session);
	if (sessionValue.uuid !== uuid) {
		return "Invalid uuid";
	}

	// ログバッファのインスタンスを作成
	const logBuffer = new LogBuffer(
		async (code, logs: Dialogue) => {
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

	// コンテキストの設定
	const context = vm.createContext({
		vmExpress,
		code,
		uuid,
		console: {
			log: (...args: string[]) => {
				const logMessage = args.join(" ");
				logBuffer.add(logMessage);
				console.log(`log from VM:${logMessage}`);
			},
			error: (...args: string[]) => {
				const logMessage = args.join(" ");
				logBuffer.add(logMessage);
				console.error(`error from VM:${logMessage}`);
			},
		},
		http,
		serverRootPath,
	});

	// 拡張機能をコンテキストに追加
	const extensionsDir = path.resolve(__dirname, "../../../../extensions");
	const extensionLoader = new ExtensionLoader(extensionsDir);
	await extensionLoader.loadExtensions(context);

	//拡張機能スクリプトをロードする。script.tsファイルのデフォルトエクスポートが拡張機能として使用される
	const extScript = await extensionLoader.loadScript();
	console.log("Script to execute: ", extScript, userScript);
	let script: Script | null = null;
	try {
		script = new vm.Script(
			`
				${extScript}
				${userScript}
			`,
		);
		script.runInContext(context);
	} catch (e) {
		console.log("error on VM execution");
		console.log(e);
		await StopCodeTest(code, uuid);
	}

	// VMのインスタンスを保存
	vmInstances[uuid] = { context, script, running: true };

	// ログバッファの処理を開始
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
		delete vmInstances[uuid]; // VMインスタンスを削除

		//ユーザーのコードが含まれたvmExpressのパスを削除
		console.log((vmExpress as Router).stack);

		const stack = (vmExpress as Router).stack;
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

export function SendIsWorkspaceRunning(isrunning: boolean): WSMessage {
	return {
		request: "updateState_isrunning",
		value: isrunning,
	};
}
