import fs from "node:fs";
import * as http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm, { type Context, type Script } from "node:vm";
import type { SessionValue, WSMessage } from "../../../../type.js";
import { sessionDB } from "../../../db/session.js";

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

// 拡張機能コンテキストを読み込む関数
const loadExtensions = async (context: Context) => {
	const extensionsDir = path.resolve(__dirname, "../../../../extensions");
	const extensionFolders = fs.readdirSync(extensionsDir);

	for (const extensionFolder of extensionFolders) {
		const ctxDir = path.join(extensionsDir, extensionFolder, "context");
		if (fs.existsSync(ctxDir) && fs.lstatSync(ctxDir).isDirectory()) {
			const files = fs.readdirSync(ctxDir);
			for (const file of files) {
				const filePath = path.join(ctxDir, file);
				// 修正箇所
				const fileURL = pathToFileURL(filePath).href;
				const mod = await import(fileURL);
				if (typeof mod.default === "function") {
					console.log("loading extension", file);
					context[path.basename(file, path.extname(file))] = mod.default;
				}
			}
		}
	}
};

// ログを蓄積するバッファと定期的なDB更新関数
class LogBuffer {
	private buffer: string[] = [];
	private interval: NodeJS.Timeout | null = null;

	constructor(
		private dbUpdater: (code: string, logs: string[]) => Promise<void>,
		private code: string,
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
		const logsToSave = [...this.buffer];
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
	DBupdator: (newData: SessionValue) => Promise<void>,
): Promise<string> {
	// verify session with uuid
	const session = await sessionDB.get(code);
	const sessionValue: SessionValue = JSON.parse(session);
	if (sessionValue.uuid !== uuid) {
		return "Invalid uuid";
	}

	// ログバッファのインスタンスを作成
	const logBuffer = new LogBuffer(async (code, logs: string[]) => {
		const session = await sessionDB.get(code);
		const sessionValue: SessionValue = JSON.parse(session);
		for (const log of logs) {
			sessionValue.dialogue.push({
				id: sessionValue.dialogue.length + 1,
				contentType: "log",
				isuser: false,
				content: log,
			});
		}
		await DBupdator(sessionValue);
	}, code);

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
	await loadExtensions(context);

	//拡張機能スクリプトをロードする。script.tsファイルのデフォルトエクスポートが拡張機能として使用される
	async function loadScript(): Promise<string | null> {
		const extensionsDir = path.resolve(__dirname, "../../../../extensions");

		function findScriptFiles(dir: string): string[] {
			let results: string[] = [];
			const list = fs.readdirSync(dir);

			for (const file of list) {
				const filePath = path.join(dir, file);
				const stat = fs.lstatSync(filePath);
				if (stat?.isDirectory()) {
					results = results.concat(findScriptFiles(filePath));
				} else if (file === "script.ts" || file === "script.js") {
					results.push(filePath);
				}
			}
			return results;
		}

		const scriptFiles = findScriptFiles(extensionsDir);
		let ExtscriptContent = "";
		for (const scriptFile of scriptFiles) {
			const scriptContent = fs.readFileSync(scriptFile, "utf-8");
			// Optionally, add a check here to ensure the content contains a default function export
			console.log("loading extension script", scriptFile);
			ExtscriptContent += scriptContent;
		}
		return ExtscriptContent;
	}

	let script: Script | null = null;
	const extScript = await loadScript();
	console.log("Script to execute: ", extScript, userScript);
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
