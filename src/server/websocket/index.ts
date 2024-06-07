import express from "express";
import { sessionDB } from "../db/index.js";
import expressWs from "express-ws";
import { SessionValue, WSMessage } from "../type.js";
import {
  ExecCodeTest,
  SendIsWorkspaceRunning,
  StopCodeTest,
} from "./vm/index.js";

const websocketserver = express.Router();
expressWs(websocketserver as any);

//スクリプトの実行状態を管理
var isRunning = false;

websocketserver.ws("/connect/:code", (ws, req) => {
  const code = req.params.code;
  const uuid = req.query.uuid;
  console.log("new connection+", uuid + code);
  //コードからuuidを取得し、一致するか確認
  sessionDB.get(code).then((value) => {
    const data: SessionValue = JSON.parse(value);
    if (data.uuid !== uuid) {
      ws.send("Invalid uuid");
      ws.close();
    }
  });
  ws.send(JSON.stringify(SendIsWorkspaceRunning(isRunning)));
  ws.on("message", async (message) => {
    const messageJson: SessionValue | WSMessage = JSON.parse(
      message.toString()
    );
    console.log("message received");
    console.log(messageJson);

    //すでにあるデータを取得
    const currentData = await sessionDB.get(code);

    const currentDataJson: SessionValue = JSON.parse(currentData);

    if ((messageJson as SessionValue).workspace) {
      //取得したDBのデータとuuidが一致するか確認＆一部のデータは引き継ぐ
      const messageJson = JSON.parse(message.toString());
      if (currentDataJson.uuid !== messageJson.uuid) {
        ws.send("Invalid uuid");
        ws.close();
      }
      const { sessioncode, uuid, workspace, updatedAt } = messageJson;
      await sessionDB.put(
        code,
        JSON.stringify({
          sessioncode: sessioncode,
          uuid: uuid,
          workspace: workspace,
          dialogue: [], //内容がある場合はアップデートするようなロジックが必要！！！
          createdAt: currentDataJson.createdAt,
          updatedAt: new Date(),
        } as SessionValue) // Add type annotation here
      );
      console.log("workspace updated");
    }

    //実行リクエストが来たときの処理
    if (
      (messageJson as WSMessage).request === "open" &&
      (messageJson as WSMessage).value
    ) {
      console.log("test code received. Executing...");
      const result = await ExecCodeTest(
        code,
        currentDataJson.uuid,
        (messageJson as WSMessage).value as string
      );
      if (result === "Valid uuid") {
        console.log("Script is running...");
        isRunning = true;
        ws.send(JSON.stringify(SendIsWorkspaceRunning(isRunning)));
      } else {
        console.log(result);
        isRunning = false;
        ws.send(JSON.stringify(SendIsWorkspaceRunning(isRunning)));
      }
    }

    //停止リクエストが来たときの処理
    if ((messageJson as WSMessage).request === "stop") {
      const result = StopCodeTest();
      // ここに停止処理を追加
      console.log(result);
      isRunning = false;
      ws.send(JSON.stringify(SendIsWorkspaceRunning(isRunning)));
    }
  });
});

//接続コードを元にUUIDを応答する
websocketserver.get("/get/:code", async (req, res) => {
  const code = req.params.code;

  // コードが存在するか確認
  const value = await sessionDB.get(code).catch(() => null);
  if (!value) {
    res.status(404).send("Session not found");
    return;
  }

  // 存在する場合はUUIDを取得
  const data: SessionValue = JSON.parse(value);
  if (!data.uuid) {
    res.status(500).send("Session uuid is invalid or not found");
    return;
  }

  // UUIDをクライアントに送信
  res.json({ uuid: data.uuid });
});

//テスト用
websocketserver.get("/hello", async (req, res) => {
  res.send("hello");
});

export default websocketserver;
