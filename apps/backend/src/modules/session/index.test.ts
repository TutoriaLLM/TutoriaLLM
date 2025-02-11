import { describe, test, beforeEach, expect } from "vitest";
import { testClient } from "hono/testing";
import { setup } from "tests/test.helper";

// need to import after test.helper
import { inject } from "@/middleware/inject";
import sessionRoutes from "./index";
import { createHonoApp } from "@/create-app";
import { appSessions } from "@/db/schema";
import { initialData } from "@/db/session";
import { eq } from "drizzle-orm";

const { createUser, db } = await setup();

describe("Sessions", () => {
	beforeEach(async () => {
		await createUser({
			userStr: "testUser123",
		});
	});
	const app = createHonoApp().use(inject).route("/", sessionRoutes);

	describe("Session creation operation", () => {
		test("new session", async () => {
			const res = await testClient(app).session.new.$post({
				query: {
					language: "en",
				},
			});

			const json = await res.json();
			expect(json).toHaveProperty("sessionId");
		});
	});

	describe("Session resuming operation", () => {
		beforeEach(async () => {
			await db
				.insert(appSessions)
				.values(
					initialData(
						"00000000-00000000-00000000-00000000",
						"session-id-123",
						"en",
						"testUser123",
					),
				)
				.execute();
		});

		test("resume session with existing id", async () => {
			const res = await testClient(app).session.resume[":key"].$post({
				param: {
					key: "session-id-123",
				},
			});

			const json = await res.json();
			expect(json).toHaveProperty("sessionId", "session-id-123");
		});

		test("resume session with non-existing id", async () => {
			const res = await testClient(app).session.resume[":key"].$post({
				param: {
					key: "non-existing-session-id",
				},
			});

			const json = await res.json();
			expect(json).toHaveProperty("error");
		});
	});

	describe("Session get operation", () => {
		beforeEach(async () => {
			await db
				.insert(appSessions)
				.values(
					initialData(
						"00000000-00000000-00000000-00000000",
						"session-id-123",
						"en",
						"testUser123",
					),
				)
				.execute();
		});

		test("get session by id", async () => {
			const res = await testClient(app).session[":key"].$get({
				param: {
					key: "session-id-123",
				},
			});

			const json = await res.json();
			expect(json).toHaveProperty("sessionId", "session-id-123");
		});
	});

	describe("Session update operation", () => {
		beforeEach(async () => {
			await db
				.insert(appSessions)
				.values(
					initialData(
						"00000000-00000000-00000000-00000000",
						"session-id-123",
						"en",
						"testUser123",
					),
				)
				.execute();
		});

		test("update session", async () => {
			const date = new Date().toISOString();
			const res = await testClient(app).session[":key"].$put({
				param: {
					key: "session-id-123",
				},
				json: {
					updatedAt: date,
				},
			});

			const json = await res.json();
			console.log(json);
			expect(json).toHaveProperty("sessionId");

			// Check if the session was updated
			const updatedSession = await db.query.appSessions.findFirst({
				where: eq(appSessions.sessionId, "session-id-123"),
			});
			expect(updatedSession).toBeDefined();
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			expect(new Date(updatedSession!.updatedAt).toISOString()).toBe(date);
		});
	});
});
