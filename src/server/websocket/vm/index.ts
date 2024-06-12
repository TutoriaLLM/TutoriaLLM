import vm, { Context, Script } from "vm";
import { sessionDB } from "../../db/index.js";
import { SessionValue, WSMessage } from "../../type.js";
import * as http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { error } from "console";
import { WebSocketServer } from "ws";
import expressWs from "express-ws";

// `__dirname` を取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// VMのインスタンスを管理するためのインターフェース
interface VMInstance {
  context: Context;
  script: Script | null;
  consoleOutput: string[];
  running: boolean;
}

// VMのインスタンスを管理するオブジェクト
const vmInstances: { [key: string]: VMInstance } = {};

// 拡張機能ファイルを読み込む関数
const loadExtensions = async (): Promise<((context: Context) => void)[]> => {
  const extensionsDir = path.resolve(__dirname, "../../../extensions");
  const extensions: ((context: Context) => void)[] = [];

  const extensionFolders = fs.readdirSync(extensionsDir);
  for (const extensionFolder of extensionFolders) {
    const vmDir = path.join(extensionsDir, extensionFolder, "vm");
    if (fs.existsSync(vmDir) && fs.lstatSync(vmDir).isDirectory()) {
      const files = fs.readdirSync(vmDir);
      for (const file of files) {
        const filePath = path.join(vmDir, file);
        const mod = await import(
          fileURLToPath(new URL(filePath, import.meta.url))
        );
        if (typeof mod.default === "function") {
          extensions.push(mod.default);
        }
      }
    }
  }

  return extensions;
};

export async function ExecCodeTest(
  code: string,
  uuid: string,
  userScript: string,
  serverRootPath: string,
  WebSocketRouter: expressWs.Router
): Promise<string> {
  // verify session with uuid
  const session = await sessionDB.get(code);
  const sessionValue: SessionValue = JSON.parse(session);
  if (sessionValue.uuid !== uuid) {
    return "Invalid uuid";
  }

  const consoleOutput: string[] = [];
  const context = vm.createContext({
    WebSocketRouter,
    uuid,
    console: {
      log: (...args: string[]) => {
        consoleOutput.push(args.join(" "));
      },
    },
    http,
    serverRootPath,
  });

  // 拡張機能をコンテキストに追加
  const loadedExtensions = await loadExtensions();
  loadedExtensions.forEach((extFunction) => {
    extFunction(context);
  });

  let script: Script | null = null;
  try {
    script = new vm.Script(`${userScript}`);
    script.runInContext(context);
  } catch (e) {
    console.log("error on VM execution");
    console.log(e);
    await StopCodeTest(code, uuid);
  }

  // VMのインスタンスを保存
  vmInstances[uuid] = { context, script, consoleOutput, running: true };

  return "Valid uuid";
}

export async function StopCodeTest(
  code: string,
  uuid: string
): Promise<{ message: string; consoleOutput: string[]; error: string }> {
  const instance = vmInstances[uuid];
  if (instance && instance.running) {
    instance.running = false;
    const output = instance.consoleOutput;
    const session = await sessionDB.get(code);
    if (JSON.parse(session).uuid !== uuid) {
      return {
        message: "Invalid uuid",
        consoleOutput: [],
        error: "Invalid uuid",
      };
    }
    console.log("updating session result");
    delete vmInstances[uuid]; // VMインスタンスを削除
    return {
      message: "Script execution stopped successfully.",
      consoleOutput: output,
      error: "",
    };
  } else {
    return {
      message: "Script is not running.",
      consoleOutput: [],
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
