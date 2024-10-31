import express from "express";
import { sessionDB } from "../db/session.js";

const sessionManager = express.Router();

/**
 * @openapi
 * /admin/sessions/list:
 *   get:
 *     description: Returns a list of all sessions
 *     responses:
 *       200:
 *         description: A list of all sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example: { error: "Error message" }
 */
// セッションの一覧を取得するAPI
sessionManager.get("/list", async (req, res) => {
	console.log("get all sessions");
	try {
		// keys() は async iterator なので、まず配列に変換します
		const keys = [];
		for await (const key of await sessionDB.keys("*")) {
			keys.push(key);
		}
		if (keys.length === 0) {
			res.json([]);
			return;
		}
		const allSessions = await sessionDB.mGet(keys);
		res.json(allSessions);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: (err as Error).message });
	}
});

/**
 * @openapi
 * /admin/sessions/{code}:
 *   delete:
 *     description: Deletes a session by code
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: No Content
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example: { error: "Error message" }
 */
// セッションの削除を行うAPI
sessionManager.delete("/:code", async (req, res) => {
	const code = req.params.code;

	try {
		await sessionDB.del(code);
		res.status(204).end();
	} catch (err) {
		res.status(500).json({ error: (err as Error).message });
	}
});

export default sessionManager;
