import { createHonoApp } from "@/create-app";
import { appSessions } from "@/db/schema";
import { initialData } from "@/db/session";
import { errorResponse } from "@/libs/errors";
import {
	deleteSession,
	getSession,
	getUserSessions,
	newSession,
	putSession,
	putSessionName,
	resumeSession,
} from "@/modules/session/routes";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { uuidv7 } from "uuidv7";

/**
 * This controller handles session management logic, including creating new sessions,
 * resuming existing sessions, updating or deleting sessions, etc.
 * Data is stored in a Postgres database instead of a Redis store.
 */
const app = createHonoApp()
	/**
	 * Create a new session
	 *
	 * Generates a new session for an authenticated user, optionally with
	 * a specified language. Uses a nanoid-based session ID and a UUIDv7 for
	 * uniqueness. Prevents duplicates by checking if the same sessionId
	 * already exists.
	 */
	.openapi(newSession, async (c) => {
		const [session, user] = [c.get("session"), c.get("user")];

		if (!(session && user)) {
			return errorResponse(c, {
				message: "Unauthorized",
				type: "UNAUTHORIZED",
			});
		}

		let language = c.req.valid("query").language;
		if (!language) {
			language = "en";
		}
		console.info("session created with initial data");

		const sessionId = nanoid(12);
		const uuid = uuidv7();

		// Check for duplicate session ID
		const value = await c.get("db").query.appSessions.findFirst({
			where: eq(appSessions.sessionId, sessionId),
		});
		if (value?.sessionId === sessionId) {
			return errorResponse(c, {
				message: "Session code already exists",
				type: "BAD_REQUEST",
			});
		}

		// Insert a new session with initial data
		await c
			.get("db")
			.insert(appSessions)
			.values(initialData(uuid, sessionId, language.toString(), user.id))
			.execute();

		console.info("session created by api");
		return c.json({ sessionId }, 200);
	})
	/**
	 * Resume an existing session by sessionId
	 *
	 * Validates that the authenticated user matches the session's owner.
	 * Returns the sessionId if it exists and is owned by the user.
	 */
	.openapi(resumeSession, async (c) => {
		const key = c.req.valid("param").key;
		const user = c.get("user");
		if (!user) {
			return errorResponse(c, {
				message: "Unauthorized",
				type: "UNAUTHORIZED",
			});
		}

		// Check if the session exists
		const value = await c.get("db").query.appSessions.findFirst({
			where: eq(appSessions.sessionId, key),
		});
		if (!value) {
			return errorResponse(c, {
				message: "Session not found",
				type: "NOT_FOUND",
			});
		}

		// Check if the session belongs to the current user
		if (value.userInfo !== user.id) {
			return errorResponse(c, {
				message: "Unauthorized",
				type: "UNAUTHORIZED",
			});
		}
		return c.json({ sessionId: key }, 200);
	})
	/**
	 * Update an existing session
	 *
	 * Overwrites session data with the new JSON body, while ensuring
	 * the authenticated user's ID matches the session record.
	 */
	.openapi(putSession, async (c) => {
		const key = c.req.valid("param").key;
		const { userInfo, ...sessionData } = c.req.valid("json");

		// Ensure user info is provided
		if (!userInfo) {
			return errorResponse(c, {
				message: "User info is required",
				type: "BAD_REQUEST",
			});
		}

		const existingSession = await c.get("db").query.appSessions.findFirst({
			where: eq(appSessions.sessionId, key),
			with: {
				userInfo: { columns: { id: true } },
			},
		});
		if (!existingSession) {
			return errorResponse(c, {
				message: "Session not found",
				type: "NOT_FOUND",
			});
		}

		// Check if the user is authorized to update this session
		const existingUserId = existingSession.userInfo?.id;
		const newUserId =
			typeof userInfo === "object" && "id" in userInfo ? userInfo.id : userInfo;

		if (existingUserId !== newUserId) {
			return errorResponse(c, {
				message: "Unauthorized",
				type: "UNAUTHORIZED",
			});
		}

		// Update the session data
		const result = await c
			.get("db")
			.update(appSessions)
			.set(sessionData)
			.where(eq(appSessions.sessionId, key))
			.returning({ id: appSessions.sessionId });

		return c.json({ sessionId: result[0].id }, 200);
	})
	/**
	 * Rename an existing session
	 */
	.openapi(putSessionName, async (c) => {
		const key = c.req.valid("param").key;
		const { sessionName } = c.req.valid("json");

		// Ensure the session exists
		const existingSession = await c.get("db").query.appSessions.findFirst({
			where: eq(appSessions.sessionId, key),
		});
		if (!existingSession) {
			return errorResponse(c, {
				message: "Session not found",
				type: "NOT_FOUND",
			});
		}

		// Update only the name
		const result = await c
			.get("db")
			.update(appSessions)
			.set({ name: sessionName })
			.where(eq(appSessions.sessionId, key))
			.returning({ id: appSessions.sessionId });

		return c.json({ sessionId: result[0].id }, 200);
	})
	/**
	 * Delete an existing session
	 *
	 * Ensures the session exists before removal. No ownership check is done here
	 * (unless enforced in the middleware).
	 */
	.openapi(deleteSession, async (c) => {
		const key = c.req.valid("param").key;
		const existingSession = await c.get("db").query.appSessions.findFirst({
			where: eq(appSessions.sessionId, key),
		});
		if (!existingSession) {
			return errorResponse(c, {
				message: "Session not found",
				type: "NOT_FOUND",
			});
		}

		const result = await c
			.get("db")
			.delete(appSessions)
			.where(eq(appSessions.sessionId, key))
			.returning({ id: appSessions.sessionId });

		return c.json({ sessionId: result[0].id }, 200);
	})
	/**
	 * Retrieve a specific session by sessionId
	 */
	.openapi(getSession, async (c) => {
		const key = c.req.valid("param").key;
		const data = await c.get("db").query.appSessions.findFirst({
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
	/**
	 * List all sessions belonging to the authenticated user
	 */
	.openapi(getUserSessions, async (c) => {
		const user = c.get("user");
		if (!user) {
			return errorResponse(c, {
				message: "Unauthorized",
				type: "UNAUTHORIZED",
			});
		}

		const data = await c.get("db").query.appSessions.findMany({
			where: eq(appSessions.userInfo, user.id),
		});
		return c.json(data, 200);
	});

/**
 * A middleware for all session routes to ensure the user is authenticated
 */
app.use("/session/**", async (c, next) => {
	const session = c.get("session");
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
