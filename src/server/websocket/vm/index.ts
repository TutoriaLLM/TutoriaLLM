import vm from "vm";
import { sessionDB } from "../../db/index.js";
import { WSMessage } from "../../type.js";
import * as http from "http";
import WebSocket from "ws";
import websocketserver from "../index.js";

let context;
let script;
let running = false;

export async function ExecCodeTest(
  code: string,
  uuid: string,
  userScript: string
) {
  // verify session with uuid
  const session = await sessionDB.get(code);
  const sessionValue = JSON.parse(session);
  if (sessionValue.uuid !== uuid) {
    return "Invalid uuid";
  }

  context = vm.createContext({
    //拡張機能ファイルで定義されたコンテキストをここに追加する
    WebSocket,
    uuid,
    console,
    http,
  });
  (script = new vm.Script(`${userScript}`, {
    importModuleDynamically: vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER,
  })),
    script.runInContext(context);

  running = true;
  return "Valid uuid";
}

export function StopCodeTest() {
  if (running) {
    context = null; // コンテキストをクリアしてスクリプトの実行を停止
    running = false;
    return "Script execution stopped.";
  } else {
    return "No script is running.";
  }
}

export function SendIsWorkspaceRunning(isrunning: boolean): WSMessage {
  return {
    request: "updateState_isrunning",
    value: isrunning,
  };
}
