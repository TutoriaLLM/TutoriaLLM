import { createHonoApp } from "@/create-app";
import { db } from "@/db";
import { appSessions } from "@/db/schema";
import { initialData } from "@/db/session";
import { errorResponse } from "@/libs/errors";
import {
	deleteSession,
	getSession,
	newSession,
	putSession,
	resumeSession,
} from "@/modules/session/routes";
import { eq } from "drizzle-orm";
import { uuidv7 as UUID } from "uuidv7";

const app = createHonoApp()
	.openapi(newSession, async (c) => {
		let language = c.req.valid("query").language;

		if (language === undefined || !language) {
			language = "en";
		}
		console.info("session created with initial data");

		const uuid = UUID();

		// Returns an error if a session with the same code already exists
		const value = await db.query.appSessions.findFirst({
			where: eq(appSessions.uuid, uuid),
		});

		if (value?.uuid === uuid) {
			return errorResponse(c, {
				message: "Session code already exists",
				type: "BAD_REQUEST",
			});
		}

		// Migrated from Redis to Postgres: from 1.0.0
		// If initial data is not specified, generate initial data and create session
		await db
			.insert(appSessions)
			.values(initialData(uuid, language.toString()))
			.execute();
		console.info("session created by api");
		return c.json(
			{
				uuid: uuid,
			},
			200,
		);
	})
	.openapi(resumeSession, async (c) => {
		const key = c.req.valid("param").key;

		// Check to see if a session for that key exists
		const value = await db.query.appSessions.findFirst({
			where: eq(appSessions.uuid, key),
		});

		if (!value) {
			return errorResponse(c, {
				message: "Session not found",
				type: "NOT_FOUND",
			});
		}
		return c.json(
			{
				uuid: key,
			},
			200,
		);

		// Migrated from Redis to Postgres: from 1.0.0
	})
	.openapi(putSession, async (c) => {
		const key = c.req.valid("param").key;
		const sessionData = c.req.valid("json");
		// Migrated from Redis to Postgres: from 1.0.0
		const existingSession = await db.query.users.findFirst({
			where: eq(appSessions.uuid, key),
		});
		if (!existingSession) {
			return errorResponse(c, {
				message: "Session not found",
				type: "NOT_FOUND",
			});
		}
		await db
			.update(appSessions)
			.set(sessionData)
			.where(eq(appSessions.uuid, key));
		return c.json({ message: "Session updated" }, 200);
	})
	.openapi(deleteSession, async (c) => {
		const key = c.req.valid("param").key;
		// Migrated from Redis to Postgres: from 1.0.0
		const existingSession = await db.query.users.findFirst({
			where: eq(appSessions.uuid, key),
		});
		if (!existingSession) {
			return errorResponse(c, {
				message: "Session not found",
				type: "NOT_FOUND",
			});
		}
		await db.delete(appSessions).where(eq(appSessions.uuid, key));
		return c.json({ message: "Session deleted" }, 200);
	})
	.openapi(getSession, async (c) => {
		const key = c.req.valid("param").key;
		// Migrated from Redis to Postgres: from 1.0.0
		const data = await db.query.appSessions.findFirst({
			where: eq(appSessions.uuid, key),
		});
		if (!data) {
			return errorResponse(c, {
				message: "Session not found",
				type: "NOT_FOUND",
			});
		}
		return c.json(data, 200);
	});

export default app;
