import express from "express";

import admin from "./admin/index.js";
import auth from "./auth/index.js";
import session from "./session/index.js";
import tutorialsAPI from "./tutorials/index.js";
import { getConfigApp } from "./getConfig.js";

//debug
console.log("apis.ts: Loading apis app");

const api = express();

// session routes
api.use("/session", session);

// Tutorial routes
api.use("/tutorial", tutorialsAPI);

// config fetch route
api.use("/config", getConfigApp);

// admin routes
api.use("/admin", admin);

// auth routes
api.use("/auth", auth);

//hello world
api.get("/hello", (req, res) => {
	res.send("Hello, world!");
});

//死活監視用のエンドポイント
api.get("/ping", (req, res) => {
	res.send("OK");
});

// 存在しないルートへのリクエストへは404を返す
api.use("*", (req, res) => {
	res.status(404).send("Not Found");
});

export default api;
