import vm from "vm";
import { sessionDB } from "../../db/index.js";
import { SessionValue, WSMessage } from "../../type.js";
import * as http from "http";
import WebSocket, { WebSocketServer } from "ws";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { error } from "console";

// `__dirname` を取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 拡張機能ファイルを読み込む関数
const loadExtensions = async () => {
  const extensionsDir = path.resolve(__dirname, "../../../extensions");
  const extensions = [];

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

let context: vm.Context;
let script: vm.Script;
let running = false;
let consoleOutput: string[] = [];

export async function ExecCodeTest(
  code: string,
  uuid: string,
  userScript: string,
  serverRootPath: string
) {
  // verify session with uuid
  const session = await sessionDB.get(code);
  const sessionValue = JSON.parse(session);
  if (sessionValue.uuid !== uuid) {
    return "Invalid uuid";
  }

  // VM コンテキストを作成し、拡張機能を追加。安全なコンテキストを作成するために、VMのコンテキストには必要最小限の機能のみを提供する
  consoleOutput = [];
  context = vm.createContext({
    WebSocket,
    WebSocketServer,
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

  try {
    script = new vm.Script(`${userScript}`);
    script.runInContext(context);
  } catch (e) {
    console.log("error on VM execution");
    console.log(e);
    await StopCodeTest(code, uuid); // Ensure StopCodeTest is awaited
    // エラーを返すとクライアントが処理できないので、暫定処置として止めている
  }

  running = true;
  return "Valid uuid";
}

export async function StopCodeTest(code: string, uuid: string) {
  if (running) {
    running = false; // Set running to false to stop further execution
    const output = consoleOutput;
    const session = await sessionDB.get(code);
    //uuidが一致するか確認
    if (JSON.parse(session).uuid !== uuid) {
      return {
        message: "Invalid uuid",
        consoleOutput: [],
        error: "Invalid uuid",
      };
    }
    console.log("updating session result");
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
