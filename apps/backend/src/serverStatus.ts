import express from "express";
// import { sessionDB } from "./db/session.js";
import cors from "cors";

//外部向けのヘルスチェック用エンドポイント
//CORSを許可しているので、外部からのアクセスも可能
const status = express();
// CORSを許可する
status.use(cors());

status.get("/", (req, res) => {
	res.send("OK");
});

export default status;
