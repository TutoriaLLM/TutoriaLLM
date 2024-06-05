import vm from "vm";
import { sessionDB } from "../../db/index.js";
import { SessionValue } from "../../type.js";

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

  // create a new context and run user script
  context = vm.createContext({
    require,
    WebSocket,
    console,
    setTimeout,
    setInterval,
    clearTimeout,
    clearInterval,
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
