import express from "express";
import { sessionDB } from "./db/session.js";
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

/**
 * @openapi
 * /status/redis:
 *   get:
 *     description: Returns Redis statistics
 *     responses:
 *       200:
 *         description: Redis statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
status.get("/redis", async (req, res) => {
	const stats = await sessionDB.info();
	function parseRedisInfo(infoText: string): Record<string, any> {
		const result: Record<string, any> = {};
		let currentSection: string | null = null;

		for (const line of infoText.split("\n")) {
			const trimmedLine = line.trim();

			// セクションの開始行を検出
			if (trimmedLine.startsWith("#")) {
				currentSection = trimmedLine.slice(2); // "# "の部分を取り除く
				result[currentSection] = {};
			}
			// キーと値をペアで処理
			else if (trimmedLine.includes(":")) {
				const [key, value] = trimmedLine.split(":", 2);
				if (currentSection) {
					result[currentSection][key.trim()] = value.trim();
				}
			}
		}

		return result;
	}
	const parsedStats = parseRedisInfo(stats);
	res.json(parsedStats);
});

export default status;
