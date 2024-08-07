//debug
console.log("session/index.ts: Loading session app");

import express from "express";
import DBrouter from "../db/session.js";
import websocketserver from "./websocket/index.js";

// セッション管理をまとめる。db/websocketサーバーのエントリーポイント
const session = express();

// 作成されたセッションのデータをもとにアクセスできるWebsocketサーバー
session.use("/socket", websocketserver);

// DBに直接アクセスしてセッションの作成を行う
session.use("/", DBrouter);

export default session;
