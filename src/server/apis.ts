import express from "express";
import expressWs from "express-ws";

import admin from "./admin/index.js";
import auth from "./auth/index.js";
import session from "./session/index.js";
import tutorialsAPI from "./tutorials/index.js";
import { getConfigApp } from "./getConfig.js";
import { vmExpress } from "./session/websocket/vm/index.js";

const api = express();

// session routes
api.use("/session", session);

// Tutorial routes
api.use("/tutorial", tutorialsAPI);

// config fetch route
api.use("/config", getConfigApp);

// vm proxy
api.use("/vm", vmExpress);

// admin routes
api.use("/admin", admin);

// auth routes
api.use("/auth", auth);

//hello world
api.get("/hello", (req, res) => {
	res.send("Hello, world!");
});

// 存在しないルートへのリクエストへは404を返す
api.use("*", (req, res) => {
	res.status(404).send("Not Found");
});

export default api;
