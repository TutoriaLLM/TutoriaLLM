import vm from "vm";
import { sessionDB } from "../../db/index.js";
import { SessionValue } from "../../type.js";

async function ExecCodeTest(code: string, uuid: string, userScript: string) {
  // verify session with uuid
  const session = await sessionDB.get(code);
  const sessionValue = JSON.parse(session);
  if (sessionValue.uuid !== uuid) {
    return "Invalid uuid";
  }

  // create a new context and run user script
  const context = vm.createContext({
    require,
    WebSocket,
    console,
    setTimeout,
    setInterval,
    clearTimeout,
    clearInterval,
  });

  const script = new vm.Script(userScript);
  script.runInContext(context);

  return "Valid uuid";
}
