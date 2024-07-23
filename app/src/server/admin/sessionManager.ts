import express from "express";
import { sessionDB } from "../db/session.js";

const sessionManager = express.Router();

// セッションの一覧を取得するAPI
sessionManager.get("/list", async (req, res) => {
	console.log("get all sessions");
	try {
		// keys() は async iterator なので、まず配列に変換します
		const keys = [];
		for await (const key of await sessionDB.keys("*")) {
			keys.push(key);
		}
		const allSessions = await sessionDB.mGet(keys);
		res.json(allSessions);
	} catch (err) {
		res.status(500).json({ error: (err as Error).message });
	}
});

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
