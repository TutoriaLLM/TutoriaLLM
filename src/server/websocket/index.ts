import express from "express";
import { sessionDB } from "../db/index.js";
import expressWs from "express-ws";
import { SessionValue } from "../type.js";

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
    const messageJson: SessionValue = JSON.parse(message.toString());
    console.log("message received");
    console.log(messageJson);

    if (messageJson.sessioncode) {
      //すでにあるデータをアップデート
      const currentData = await sessionDB.get(code);
      //すでにあるデータを取得し、uuidが一致するか確認＆一部のデータは引き継ぐ
      const currentDataJson: SessionValue = JSON.parse(currentData);
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
  });

  ws.send("Hello! Message From Server!!");
});

//接続コードを元にwebsocketサーバーにUUID付きで接続する
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
  res.json({ uuid: data.uuid, websocketUrl: `ws://${req.headers.host}/ws` });
});

//テスト用
websocketserver.get("/hello", async (req, res) => {
  res.send("hello");
});

export default websocketserver;
