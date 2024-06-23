import express from "express";
import dBrouter from "../db/session.js";
import websocketserver from "../websocket/index.js";

// セッション管理をまとめる。db/websocketサーバーのエントリーポイント
const session = express.Router();

// 作成されたセッションのデータをもとにアクセスできるWebsocketサーバー
session.use("/ws", websocketserver);

// DBに直接アクセスしてセッションの作成を行う
session.use("/", dBrouter);

export default session;
