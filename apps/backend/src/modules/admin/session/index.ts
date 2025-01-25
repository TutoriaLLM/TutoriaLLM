import { createHonoApp } from "@/create-app";
import { db } from "@/db";
import { appSessions } from "@/db/schema";
import { errorResponse } from "@/libs/errors";
import {
	deleteSession,
	deleteSessionByUserId,
	downloadAllSessions,
	findSessionFromUserId,
	listSessions,
} from "@/modules/admin/session/routes";
import { asc, count, desc, eq } from "drizzle-orm";

const app = createHonoApp()
	.openapi(downloadAllSessions, async (c) => {
		const allSessions = await db.query.appSessions.findMany({
			with: {
				userInfo: {
					columns: {
						id: true,
						username: true,
						email: true,
						image: true,
					},
				},
			},
		});
		return c.json(allSessions, 200);
	})
	.openapi(findSessionFromUserId, async (c) => {
		const userId = c.req.valid("param").userId;
		const { page, limit, sortField, sortOrder } = c.req.valid("query");

		const start = Math.max(((page || 1) - 1) * (limit || 10), 0);
		const end = start + (limit || 10);
		const sortOrderType = sortOrder === "asc" ? asc : desc;
		const sortFieldType = appSessions[sortField];
		const [sessions, total] = await Promise.all([
			db.query.appSessions.findMany({
				where: eq(appSessions.userInfo, userId),
				orderBy: [sortOrderType(sortFieldType)],
				limit: end - start,
				offset: start,
				with: {
					userInfo: {
						columns: {
							id: true,
							username: true,
							email: true,
							image: true,
						},
					},
				},
			}),
			db
				.select({ count: count(eq(appSessions.userInfo, userId)) })
				.from(appSessions),
		]);

		return c.json(
			{
				sessions: sessions,
				total: total[0].count,
				page,
				limit,
			},
			200,
		);
	})
	.openapi(listSessions, async (c) => {
		const { page, limit, sortField, sortOrder } = c.req.valid("query");
		try {
			const start = Math.max(((page || 1) - 1) * (limit || 10), 0);
			const end = start + (limit || 10);
			const sortOrderType = sortOrder === "asc" ? asc : desc;
			const sortFieldType = appSessions[sortField];
			const [sessions, total] = await Promise.all([
				db.query.appSessions.findMany({
					orderBy: [sortOrderType(sortFieldType)],
					limit: end - start,
					offset: start,
					with: {
						userInfo: {
							columns: {
								id: true,
								username: true,
								email: true,
								image: true,
							},
						},
					},
				}),
				db.select({ count: count() }).from(appSessions),
			]);

			return c.json(
				{
					sessions: sessions,
					total: total[0].count,
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
		const sessionId = c.req.valid("param").sessionId;
		console.info(sessionId);
		try {
			await db
				.delete(appSessions)
				.where(eq(appSessions.sessionId, sessionId))
				.returning({ deletedId: appSessions.sessionId });
			return c.json({ sessionId: sessionId }, 200);
		} catch (err) {
			console.error(err);
			return errorResponse(c, {
				message: "Failed to delete session",
				type: "SERVER_ERROR",
			});
		}
	})
	.openapi(deleteSessionByUserId, async (c) => {
		const userId = c.req.valid("param").userId;
		try {
			await db
				.delete(appSessions)
				.where(eq(appSessions.userInfo, userId))
				.returning({ deletedId: appSessions.sessionId });
			return c.json({ userId: userId }, 200);
		} catch (err) {
			console.error(err);
			return errorResponse(c, {
				message: "Failed to delete session",
				type: "SERVER_ERROR",
			});
		}
	});

export default app;
