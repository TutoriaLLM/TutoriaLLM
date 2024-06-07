import vm from "vm";
import { sessionDB } from "../../db/index.js";
import { SessionValue, WSMessage } from "../../type.js";
import { WebSocketServer } from "ws"; // WebSocketモジュールのインポート
import { v4 as uuid } from "uuid";
import Module from "module";

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
    WebSocketServer,
    uuid() {},
    console, // コンテキストにconsoleを追加
    code, // コンテキストにコードを追加
  });
  script = new vm.Script(userScript);
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
