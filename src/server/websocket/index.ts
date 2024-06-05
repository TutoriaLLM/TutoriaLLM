import express from "express";
import { sessionDB } from "../db/index.js";
import expressWs from "express-ws";
import { SessionValue, WSrequestMessage } from "../type.js";
import { ExecCodeTest, StopCodeTest } from "./vm/index.js";

const websocketserver = express.Router();
expressWs(websocketserver as any);

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
  ws.on("message", async (message) => {
    const messageJson: SessionValue | WSrequestMessage = JSON.parse(
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
      ws.send("workspace updated");
    }
    if ((messageJson as WSrequestMessage).request === "open") {
      console.log("test code received. Executing...");
      const result = await ExecCodeTest(
        code,
        currentDataJson.uuid,
        "console.log('test')"
      );
      if (result === "Valid uuid") {
        console.log("Script is running...");
      } else {
        console.log(result);
      }
    }
    if ((messageJson as WSrequestMessage).request === "stop") {
      const result = StopCodeTest();
      // ここに停止処理を追加
      console.log(result);
    }
  });

  ws.send("Hello! Message From Server!!");
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
