import vm, { Context, Script } from "vm";
import { sessionDB } from "../../db/session.js";
import { SessionValue, WSMessage } from "../../../type.js";
import * as http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
const loadExtensions = async (context: Context): Promise<void> => {
  const extensionsDir = path.resolve(__dirname, "../../../extensions");
  const extensionFolders = fs.readdirSync(extensionsDir);

  for (const extensionFolder of extensionFolders) {
    const vmDir = path.join(extensionsDir, extensionFolder, "context");
    if (fs.existsSync(vmDir) && fs.lstatSync(vmDir).isDirectory()) {
      const files = fs.readdirSync(vmDir);
      for (const file of files) {
        const filePath = path.join(vmDir, file);
        const mod = await import(
          fileURLToPath(new URL(filePath, import.meta.url))
        );
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
    private code: string
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
import express from "express";
import expressWs from "express-ws";

export const vmExpress = express.Router();
expressWs(vmExpress as any);

export async function ExecCodeTest(
  code: string,
  uuid: string,
  userScript: string,
  serverRootPath: string,
  DBupdator: (newData: SessionValue) => Promise<void>
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
    logs.forEach((log) => {
      sessionValue.dialogue.push({
        contentType: "log",
        isuser: false,
        content: log,
      });
    });
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
        console.log("log from VM:" + logMessage);
      },
      error: (...args: string[]) => {
        const logMessage = args.join(" ");
        logBuffer.add(logMessage);
        console.error("error from VM:" + logMessage);
      },
    },
    http,
    serverRootPath,
  });

  // 拡張機能をコンテキストに追加
  await loadExtensions(context);

  let script: Script | null = null;
  try {
    script = new vm.Script(userScript);
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
  uuid: string
): Promise<{ message: string; error: string }> {
  const instance = vmInstances[uuid];
  if (instance && instance.running) {
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
    return {
      message: "Script execution stopped successfully.",
      error: "",
    };
  } else {
    return {
      message: "Script is not running.",
      error: "Script is not running.",
    };
  }
}

export function SendIsWorkspaceRunning(isrunning: boolean): WSMessage {
  return {
    request: "updateState_isrunning",
    value: isrunning,
  };
}
