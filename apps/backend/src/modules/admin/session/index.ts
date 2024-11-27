import { OpenAPIHono } from "@hono/zod-openapi";
import { deleteSession, downloadAllSessions, listSessions } from "./routes";
import { db } from "../../../db";
import { appSessions } from "../../../db/schema";
import { errorResponse } from "../../../libs/errors";
import { asc, desc, eq } from "drizzle-orm";

const app = new OpenAPIHono()
	.openapi(downloadAllSessions, async (c) => {
		const allSessions = await db.select().from(appSessions);
		return c.json(allSessions, 200);
	})
	.openapi(listSessions, async (c) => {
		const { page, limit, sortField, sortOrder } = c.req.valid("query");
		try {
			const start = (page || 1) - 1 * (limit || 10);
			const end = start + (limit || 10);
			const sortOrderType = sortOrder === "asc" ? asc : desc;
			const sortFieldType = appSessions[sortField];
			const sessions = await db
				.select()
				.from(appSessions)
				.orderBy(sortOrderType(sortFieldType))
				.offset(start)
				.limit(end - start);
			return c.json(
				{
					sessions: sessions,
					total: sessions.length,
					page,
					limit,
				},
				200,
			);
		} catch (err) {
			return errorResponse(c, {
				message: "Failed to list sessions",
				type: "SERVER_ERROR",
			});
		}
	})
	.openapi(deleteSession, async (c) => {
		const code = c.req.valid("param").sessionCode;
		try {
			await db.delete(appSessions).where(eq(appSessions.sessioncode, code));
			return c.json({ sessionCode: code }, 200);
		} catch (err) {
			return errorResponse(c, {
				message: "Failed to delete session",
				type: "SERVER_ERROR",
			});
		}
	});

export default app;
