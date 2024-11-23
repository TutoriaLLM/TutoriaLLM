import express from "express";
// import { sessionDB } from "./db/session.js";
import cors from "cors";

//外部向けのヘルスチェック用エンドポイント
//CORSを許可しているので、外部からのアクセスも可能
const status = express();
// CORSを許可する
status.use(cors());

/**
 * @openapi
 * /status:
 *   get:
 *     description: Returns OK for health check
 *     responses:
 *       200:
 *         description: Health check successful
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: OK
 */
status.get("/", (req, res) => {
	res.send("OK");
});

export default status;
