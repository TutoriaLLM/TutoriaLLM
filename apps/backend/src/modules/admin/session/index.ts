import type { Context } from "@/context";
import { db } from "@/db";
import { appSessions } from "@/db/schema";
import { defaultHook } from "@/libs/default-hook";
import { errorResponse } from "@/libs/errors";
import {
	deleteSession,
	downloadAllSessions,
	listSessions,
} from "@/modules/admin/session/routes";
import { OpenAPIHono } from "@hono/zod-openapi";
import { asc, desc, eq } from "drizzle-orm";

const app = new OpenAPIHono<Context>({ defaultHook })
	.openapi(downloadAllSessions, async (c) => {
		const allSessions = await db.select().from(appSessions);
		return c.json(allSessions, 200);
	})
	.openapi(listSessions, async (c) => {
		const { page, limit, sortField, sortOrder } = c.req.valid("query");
		try {
			const start = Math.max((page || 1) - 1 * (limit || 10), 0);
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
			console.error(err);
			return errorResponse(c, {
				message: "Failed to list sessions",
				type: "SERVER_ERROR",
			});
		}
	})
	.openapi(deleteSession, async (c) => {
		const code = c.req.valid("param").sessionCode;
		console.log(code);
		try {
			await db
				.delete(appSessions)
				.where(eq(appSessions.sessioncode, code))
				.returning({ deletedId: appSessions.sessioncode });
			return c.json({ sessionCode: code }, 200);
		} catch (err) {
			console.error(err);
			return errorResponse(c, {
				message: "Failed to delete session",
				type: "SERVER_ERROR",
			});
		}
	});

export default app;
