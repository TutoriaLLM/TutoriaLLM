import express from "express";
import expressWs from "express-ws";
import DBrouter from "../db/session.js";
import websocketserver from "./websocket/index.js";

// セッション管理をまとめる。db/websocketサーバーのエントリーポイント
const session = express();
expressWs(session);

// 作成されたセッションのデータをもとにアクセスできるWebsocketサーバー
session.use("/ws", websocketserver);

// DBに直接アクセスしてセッションの作成を行う
session.use("/", DBrouter);

export default session;
