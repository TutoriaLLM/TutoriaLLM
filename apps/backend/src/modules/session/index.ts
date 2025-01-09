import { createHonoApp } from "@/create-app";
import { db } from "@/db";
import { appSessions } from "@/db/schema";
import { initialData } from "@/db/session";
import { auth } from "@/libs/auth";
import { errorResponse } from "@/libs/errors";
import {
	deleteSession,
	getSession,
	getUserSessions,
	newSession,
	putSession,
	resumeSession,
} from "@/modules/session/routes";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { uuidv7 } from "uuidv7";

const app = createHonoApp()
	.openapi(newSession, async (c) => {
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});
		if (!session) {
			return errorResponse(c, {
				message: "Unauthorized",
				type: "UNAUTHORIZED",
			});
		}
		let language = c.req.valid("query").language;

		if (language === undefined || !language) {
			language = "en";
		}
		console.info("session created with initial data");

		const sessionId = nanoid(12);
		const uuid = uuidv7();

		// Returns an error if a session with the same code already exists
		const value = await db.query.appSessions.findFirst({
			where: eq(appSessions.sessionId, sessionId),
		});

		if (value?.sessionId === sessionId) {
			return errorResponse(c, {
				message: "Session code already exists",
				type: "BAD_REQUEST",
			});
		}

		// Migrated from Redis to Postgres: from 1.0.0
		// If initial data is not specified, generate initial data and create session
		await db
			.insert(appSessions)
			.values(
				initialData(uuid, sessionId, language.toString(), session.user.id),
			)
			.execute();
		console.info("session created by api");
		return c.json(
			{
				sessionId: sessionId,
			},
			200,
		);
	})
	.openapi(resumeSession, async (c) => {
		const key = c.req.valid("param").key;

		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});
		if (!session) {
			return errorResponse(c, {
				message: "Unauthorized",
				type: "UNAUTHORIZED",
			});
		}
		// Check to see if a session for that key exists
		const value = await db.query.appSessions.findFirst({
			where: eq(appSessions.sessionId, key),
		});

		if (!value) {
			return errorResponse(c, {
				message: "Session not found",
				type: "NOT_FOUND",
			});
		}
		if (value.userInfo !== session.user.id) {
			return errorResponse(c, {
				message: "Unauthorized",
				type: "UNAUTHORIZED",
			});
		}
		return c.json(
			{
				sessionId: key,
			},
			200,
		);

		// Migrated from Redis to Postgres: from 1.0.0
	})
	.openapi(putSession, async (c) => {
		const key = c.req.valid("param").key;
		const { userInfo, ...sessionData } = c.req.valid("json");
		if (!userInfo) {
			return errorResponse(c, {
				message: "User info is required",
				type: "BAD_REQUEST",
			});
		}
		// Migrated from Redis to Postgres: from 1.0.0
		const existingSession = await db.query.appSessions.findFirst({
			where: eq(appSessions.sessionId, key),
			with: {
				userInfo: {
					columns: {
						id: true,
					},
				},
			},
		});
		if (!existingSession) {
			return errorResponse(c, {
				message: "Session not found",
				type: "NOT_FOUND",
			});
		}
		if (
			existingSession.userInfo?.id !==
			(typeof userInfo === "object" && "id" in userInfo
				? userInfo.id
				: userInfo)
		) {
			return errorResponse(c, {
				message: "Unauthorized",
				type: "UNAUTHORIZED",
			});
		}
		const result = await db
			.update(appSessions)
			.set(sessionData)
			.where(eq(appSessions.sessionId, key))
			.returning({ id: appSessions.sessionId });
		return c.json({ sessionId: result[0].id }, 200);
	})
	.openapi(deleteSession, async (c) => {
		const key = c.req.valid("param").key;
		// Migrated from Redis to Postgres: from 1.0.0
		const existingSession = await db.query.appSessions.findFirst({
			where: eq(appSessions.sessionId, key),
		});
		if (!existingSession) {
			return errorResponse(c, {
				message: "Session not found",
				type: "NOT_FOUND",
			});
		}
		const result = await db
			.delete(appSessions)
			.where(eq(appSessions.sessionId, key))
			.returning({ id: appSessions.sessionId });
		return c.json({ sessionId: result[0].id }, 200);
	})
	.openapi(getSession, async (c) => {
		const key = c.req.valid("param").key;
		// Migrated from Redis to Postgres: from 1.0.0
		const data = await db.query.appSessions.findFirst({
			where: eq(appSessions.sessionId, key),
		});
		if (!data) {
			return errorResponse(c, {
				message: "Session not found",
				type: "NOT_FOUND",
			});
		}
		return c.json(data, 200);
	})
	.openapi(getUserSessions, async (c) => {
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});
		if (!session) {
			return errorResponse(c, {
				message: "Unauthorized",
				type: "UNAUTHORIZED",
			});
		}
		// Migrated from Redis to Postgres: from 1.0.0
		const data = await db.query.appSessions.findMany({
			where: eq(appSessions.userInfo, session.user.id),
		});
		return c.json(data, 200);
	});

app.use("/session/**", async (c, next) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});
	if (!session) {
		console.info("no session");
		return errorResponse(c, {
			message: "Unauthorized",
			type: "UNAUTHORIZED",
		});
	}
	await next();
});

export default app;
