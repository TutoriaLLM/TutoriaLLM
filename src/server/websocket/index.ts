import express from "express";
import { sessionDB } from "../db/index.js";
import expressWs from "express-ws";
import { SessionValue, WSMessage } from "../../type.js";
import {
  ExecCodeTest,
  SendIsWorkspaceRunning,
  StopCodeTest,
} from "./vm/index.js";
import { send } from "vite";

const websocketserver = express.Router();
expressWs(websocketserver as any);

const clients = new Map<string, any>(); // WebSocketクライアントを管理するマップ

websocketserver.ws("/connect/:code", async (ws, req) => {
  const code = req.params.code;
  const uuid = req.query.uuid as string;
  console.log("new connection+", code);

  const value = await sessionDB.get(code);
  const data: SessionValue = JSON.parse(value);

  if (data.uuid !== uuid) {
    ws.send("Invalid uuid");
    ws.close();
    return;
  }

  // WebSocketクライアントのIDを生成
  const clientId = `${uuid}-${Math.random().toString(36).substr(2, 9)}`;
  clients.set(clientId, ws);

  // クライアントIDをセッションに追加
  if (!data.clients.includes(clientId)) {
    data.clients.push(clientId);
    await sessionDB.put(code, JSON.stringify(data));
  }

  ws.send(JSON.stringify(SendIsWorkspaceRunning(data.isVMRunning)));

  ws.on("message", async (message) => {
    const messageJson: SessionValue | WSMessage = JSON.parse(
      message.toString()
    );
    console.log("message received");
    console.log(messageJson);

    const currentData = await sessionDB.get(code);
    const currentDataJson: SessionValue = JSON.parse(currentData);
    let isRunning = currentDataJson.isVMRunning;

    const updateDatabase = async (newData: SessionValue) => {
      await sessionDB.put(code, JSON.stringify(newData));
      // 全クライアントに更新を通知
      newData.clients.forEach((id) => {
        if (clients.has(id)) {
          clients.get(id).send(JSON.stringify(newData));
        }
      });
    };
    async function updateLog(message: string) {
      if (!message) return;
      await updateDatabase({
        ...currentDataJson,
        dialogue: [
          ...currentDataJson.dialogue,
          {
            contentType: "log",
            isuser: false,
            content: message,
          },
        ],
      });
    }

    if ((messageJson as SessionValue).workspace) {
      const messageJson = JSON.parse(message.toString());
      if (currentDataJson.uuid !== messageJson.uuid) {
        ws.send("Invalid uuid");
        ws.close();
      }
      const { sessioncode, uuid, workspace, dialogue } = messageJson;
      const dataToPut: SessionValue = {
        sessioncode: sessioncode,
        uuid: uuid,
        workspace: workspace,
        dialogue: dialogue,
        createdAt: currentDataJson.createdAt,
        updatedAt: new Date(),
        isVMRunning: currentDataJson.isVMRunning,
        clients: currentDataJson.clients,
      };

      await updateDatabase(dataToPut);
      console.log("workspace updated");
    }

    if ((messageJson as WSMessage).request === "open") {
      if ((messageJson as WSMessage).value === (undefined || null || "")) {
        isRunning = false;
        currentDataJson.isVMRunning = isRunning;
        await updateDatabase(currentDataJson);
        updateLog("Code is invalid");
        sendToAllClients(currentDataJson, SendIsWorkspaceRunning(isRunning));
        return;
      }
      console.log("test code received. Executing...");
      const result = await ExecCodeTest(
        code,
        currentDataJson.uuid,
        (messageJson as WSMessage).value as string,
        `/vm/${code}`,
        websocketserver
      );
      if (result === "Valid uuid") {
        console.log("Script is running...");
        isRunning = true;
        currentDataJson.isVMRunning = isRunning;
        await updateDatabase(currentDataJson);
        sendToAllClients(currentDataJson, SendIsWorkspaceRunning(isRunning));
      } else {
        console.log(result);
        isRunning = false;
        currentDataJson.isVMRunning = isRunning;
        await updateDatabase(currentDataJson);
        sendToAllClients(currentDataJson, SendIsWorkspaceRunning(isRunning));
      }
    }

    if ((messageJson as WSMessage).request === "stop") {
      const result = await StopCodeTest(code, uuid);
      console.log(result);
      isRunning = false;
      currentDataJson.isVMRunning = isRunning;
      updateLog(result.consoleOutput.join("\n"));
      sendToAllClients(currentDataJson, SendIsWorkspaceRunning(isRunning));
    }
  });

  ws.on("close", async () => {
    console.log("disconnected client");
    const currentData = await sessionDB.get(code);
    const currentDataJson: SessionValue = JSON.parse(currentData);
    currentDataJson.clients = currentDataJson.clients.filter(
      (id) => id !== clientId
    );
    await sessionDB.put(code, JSON.stringify(currentDataJson));
    clients.delete(clientId); // マップから削除
  });
});

//接続コードを元にUUIDを応答する
websocketserver.get("/get/:code", async (req, res) => {
  const code = req.params.code;

  const value = await sessionDB.get(code).catch(() => null);
  if (!value) {
    res.status(404).send("Session not found");
    return;
  }

  const data: SessionValue = JSON.parse(value);
  if (!data.uuid) {
    res.status(500).send("Session uuid is invalid or not found");
    return;
  }

  res.json({ uuid: data.uuid });
});

websocketserver.get("/hello", async (req, res) => {
  res.send("hello");
});

function sendToAllClients(session: SessionValue, message?: WSMessage) {
  session.clients.forEach((id) => {
    if (clients.has(id)) {
      clients.get(id).send(JSON.stringify(message ? message : session));
    }
  });
}

export default websocketserver;
