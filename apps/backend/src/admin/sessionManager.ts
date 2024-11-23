import express from "express";
// import { sessionDB } from "../db/session.js";
import { db } from "../db/index.js";
import type { SessionValue } from "../../../frontend/type.js";
import { appSessions } from "../db/schema.js";
import { asc, desc, eq } from "drizzle-orm";

const sessionManager = express.Router();

//セッションの全データを取得するAPI(ダウンロード用)
sessionManager.get("/download", async (req, res) => {
	console.log("download all sessions");
	try {
		//RedisからPostgresに移行しました: from 1.0.0
		const allSessions = await db.select().from(appSessions);
		res.json(allSessions);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: (err as Error).message });
	}
});

// セッションの一覧を取得するAPI
sessionManager.get("/list", async (req, res) => {
	console.log("get all sessions");
	const page = Number.parseInt(req.query.page as string) || 1;
	const limit = Number.parseInt(req.query.limit as string) || 10;
	const sortField = (req.query.sortField as keyof SessionValue) || "updatedAt";
	const sortOrder = (req.query.sortOrder as string) || "desc";
	const start = (page - 1) * limit;
	const end = start + limit;

	try {
		//RedisからPostgresに移行しました: from 1.0.0
		const sortOrderType = sortOrder === "asc" ? asc : desc;
		const sortFieldType = appSessions[sortField];
		const sessions = await db
			.select()
			.from(appSessions)
			.orderBy(sortOrderType(sortFieldType))
			.offset(start)
			.limit(limit);

		res.json({
			sessions: sessions,
			total: sessions.length,
			page,
			limit,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: (err as Error).message });
	}
});

// セッションの削除を行うAPI
sessionManager.delete("/:code", async (req, res) => {
	const code = req.params.code;

	try {
		//RedisからPostgresに移行しました: from 1.0.0
		await db.delete(appSessions).where(eq(appSessions.sessioncode, code));
		res.status(204).end();
	} catch (err) {
		res.status(500).json({ error: (err as Error).message });
	}
});

export default sessionManager;
