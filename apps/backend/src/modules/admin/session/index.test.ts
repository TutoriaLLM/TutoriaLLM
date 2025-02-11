import { beforeEach, describe, expect, test } from "vitest";
import { testClient } from "hono/testing";

import { setup } from "tests/test.helper";

// need to import after test.helper
import sessionRoutes from "./index";
import { createHonoApp } from "@/create-app";
import { inject } from "@/middleware/inject";
import { initialData } from "@/db/session";
import { appSessions } from "@/db/schema";
const { createUser, db } = await setup();

describe("Admin Sessions", () => {
	beforeEach(async () => {
		await createUser({
			userStr: "testUser123",
		});
		/**
		 * Create another user for testing
		 */
		await createUser({
			userStr: "testUser124",
		});
	});
	const app = createHonoApp().use(inject).route("/", sessionRoutes);

	describe("Session download operation", () => {
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
		test("download all sessions", async () => {
			const res = await testClient(app).admin.session.download.$get();
			const json = await res.json();
			expect(json).toHaveLength(1);
		});
	});

	describe("Session find operation", () => {
		beforeEach(async () => {
			await db
				.insert(appSessions)
				.values([
					initialData(
						"00000000-00000000-00000000-00000000",
						"session-id-123",
						"en",
						"testUser123",
					),
					initialData(
						"00000000-00000000-00000000-00000001",
						"session-id-124",
						"en",
						"testUser124",
					),
				])
				.execute();
		});
		test("find session by user id", async () => {
			const res = await testClient(app).admin.session.list[":userId"].$get({
				query: {
					page: "1",
					limit: "10",
					sortField: "createdAt",
					sortOrder: "asc",
				},
				param: {
					userId: "testUser123",
				},
			});
			const json = await res.json();
			console.log(json);
			expect(json).toHaveProperty("sessions");
			if ("sessions" in json) {
				expect(json.sessions).toHaveLength(1);
			}
			expect(json).toHaveProperty("total", 1);
			expect(json).toHaveProperty("page", 1);
			expect(json).toHaveProperty("limit", 10);
		});
	});

	describe("Session list operation", () => {
		beforeEach(async () => {
			await db
				.insert(appSessions)
				.values([
					initialData(
						"00000000-00000000-00000000-00000000",
						"session-id-123",
						"en",
						"testUser123",
					),
					initialData(
						"00000000-00000000-00000000-00000001",
						"session-id-124",
						"en",
						"testUser124",
					),
				])
				.execute();
		});
		test("list sessions", async () => {
			const res = await testClient(app).admin.session.list.$get({
				query: {
					page: "1",
					limit: "10",
					sortField: "createdAt",
					sortOrder: "asc",
				},
			});
			const json = await res.json();
			expect(json).toHaveProperty("sessions");
			if ("sessions" in json) {
				expect(json.sessions).toHaveLength(2);
			}
			expect(json).toHaveProperty("total", 2);
			expect(json).toHaveProperty("page", 1);
			expect(json).toHaveProperty("limit", 10);
		});
	});

	describe("Session delete operation", () => {
		beforeEach(async () => {
			await db
				.insert(appSessions)
				.values([
					initialData(
						"00000000-00000000-00000000-00000000",
						"session-id-123",
						"en",
						"testUser123",
					),
					initialData(
						"00000000-00000000-00000000-00000001",
						"session-id-124",
						"en",
						"testUser124",
					),
				])
				.execute();
		});
		test("delete session by id", async () => {
			const beforeDelete = await db.query.appSessions.findMany();
			expect(beforeDelete).toHaveLength(2);
			const res = await testClient(app).admin.session[":sessionId"].$delete({
				param: {
					sessionId: "session-id-123",
				},
			});
			expect(res.status).toBe(200);
			const afterDelete = await db.query.appSessions.findMany();
			expect(afterDelete).toHaveLength(1);
		});
	});

	describe("Delete all sessions by user id", () => {
		beforeEach(async () => {
			await db
				.insert(appSessions)
				.values([
					/**
					 * Should be deleted
					 */
					initialData(
						"00000000-00000000-00000000-00000000",
						"session-id-123",
						"en",
						"testUser123",
					),
					initialData(
						"00000000-00000000-00000000-00000001",
						"session-id-124",
						"en",
						"testUser123",
					),
					/**
					 * Should not be deleted
					 */
					initialData(
						"00000000-00000000-00000000-00000002",
						"session-id-125",
						"en",
						"testUser124",
					),
				])
				.execute();
		});
		test("delete all sessions by user id", async () => {
			const beforeDelete = await db.query.appSessions.findMany();
			expect(beforeDelete).toHaveLength(3);
			const res = await testClient(app).admin.session.user[":userId"].$delete({
				param: {
					userId: "testUser123",
				},
			});
			expect(res.status).toBe(200);
			const afterDelete = await db.query.appSessions.findMany();
			expect(afterDelete).toHaveLength(1);
		});
	});
});
