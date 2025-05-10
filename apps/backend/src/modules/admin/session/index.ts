import { createHonoApp } from "@/create-app";
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

/**
 * This controller handles administrative session management, allowing
 * download of all sessions, listing sessions with pagination and sorting,
 * as well as deleting individual or user-owned sessions.
 */
const app = createHonoApp()
	/**
	 * Download all sessions in JSON format
	 */
	.openapi(downloadAllSessions, async (c) => {
		const allSessions = await c.get("db").query.appSessions.findMany({
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
	/**
	 * Find sessions by userId
	 *
	 * Supports pagination (page, limit) and sorting (sortField, sortOrder).
	 * Returns the filtered list of sessions and the total count.
	 */
	.openapi(findSessionFromUserId, async (c) => {
		const userId = c.req.valid("param").userId;
		const { page, limit, sortField, sortOrder } = c.req.valid("query");

		const start = Math.max(((page || 1) - 1) * (limit || 10), 0);
		const end = start + (limit || 10);
		const sortOrderType = sortOrder === "asc" ? asc : desc;
		const sortFieldType = appSessions[sortField];

		const [sessions, total] = await Promise.all([
			c.get("db").query.appSessions.findMany({
				where: eq(appSessions.userInfo, userId),
				orderBy: [sortOrderType(sortFieldType)],
				limit: end - start,
				offset: start,
				columns: {
					dialogue: false,
					quickReplies: false,
					isReplying: false,
					workspace: false,
					isVMRunning: false,
					userAudio: false,
					screenshot: false,
				},
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
			c
				.get("db")
				.select({ count: count(appSessions.sessionId) }) // 主キーなど null にならないカラムを指定
				.from(appSessions)
				.where(eq(appSessions.userInfo, userId)), // ここでフィルタリング
		]);

		return c.json(
			{
				sessions,
				total: total[0].count,
				page,
				limit,
			},
			200,
		);
	})
	/**
	 * List all sessions with pagination / sorting
	 */
	.openapi(listSessions, async (c) => {
		const { page, limit, sortField, sortOrder } = c.req.valid("query");
		try {
			const start = Math.max(((page || 1) - 1) * (limit || 10), 0);
			const end = start + (limit || 10);
			const sortOrderType = sortOrder === "asc" ? asc : desc;
			const sortFieldType = appSessions[sortField];

			const [sessions, total] = await Promise.all([
				c.get("db").query.appSessions.findMany({
					orderBy: [sortOrderType(sortFieldType)],
					limit: end - start,
					offset: start,
					columns: {
						dialogue: false,
						quickReplies: false,
						isReplying: false,
						workspace: false,
						isVMRunning: false,
						userAudio: false,
						screenshot: false,
					},
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
				c.get("db").select({ count: count() }).from(appSessions),
			]);

			return c.json(
				{
					sessions,
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
	/**
	 * Delete a specific session by sessionId
	 */
	.openapi(deleteSession, async (c) => {
		const sessionId = c.req.valid("param").sessionId;
		console.info(sessionId);
		try {
			await c
				.get("db")
				.delete(appSessions)
				.where(eq(appSessions.sessionId, sessionId))
				.returning({ deletedId: appSessions.sessionId });

			return c.json({ sessionId }, 200);
		} catch (err) {
			console.error(err);
			return errorResponse(c, {
				message: "Failed to delete session",
				type: "SERVER_ERROR",
			});
		}
	})
	/**
	 * Delete all sessions belonging to a specified userId
	 */
	.openapi(deleteSessionByUserId, async (c) => {
		const userId = c.req.valid("param").userId;
		try {
			await c
				.get("db")
				.delete(appSessions)
				.where(eq(appSessions.userInfo, userId))
				.returning({ deletedId: appSessions.sessionId });

			return c.json({ userId }, 200);
		} catch (err) {
			console.error(err);
			return errorResponse(c, {
				message: "Failed to delete session",
				type: "SERVER_ERROR",
			});
		}
	});

export default app;
