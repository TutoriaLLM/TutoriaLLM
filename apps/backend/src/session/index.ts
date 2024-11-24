//debug
console.log("session/index.ts: Loading session app");

import { OpenAPIHono } from "@hono/zod-openapi";
import DBrouter from "../modules/session/db/index";
// import websocketserver from "./websocket/index.js";

// セッション管理をまとめる。db/websocketサーバーのエントリーポイント
const app = new OpenAPIHono();

// 作成されたセッションのデータをもとにアクセスできるWebsocketサーバー
// app.use("/socket", websocketserver);

// DBに直接アクセスしてセッションの作成を行う
app.route("/", DBrouter);

export default app;
