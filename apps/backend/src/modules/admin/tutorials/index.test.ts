import { beforeEach, describe, expect, test } from "vitest";
import { testClient } from "hono/testing";

import { setup } from "tests/test.helper";
// need to import after test.helper
import tutorialRoutes from "./index";
import { createHonoApp } from "@/create-app";
import { inject } from "@/middleware/inject";
import { tutorials } from "@/db/schema";
import { eq } from "drizzle-orm";

const { createUser, db } = await setup();

describe("Admin Tutorials", () => {
	beforeEach(async () => {
		await createUser({
			userStr: "testUser123",
		});
	});
	const app = createHonoApp().use(inject).route("/", tutorialRoutes);

	describe("Get all tutorials", () => {
		beforeEach(async () => {
			// このテストでは取得件数や構造のみをチェックするため、IDは使用していません
			await db
				.insert(tutorials)
				.values([
					{
						content: "test content",
						language: "en",
						metadata: {
							description: "test description",
							title: "test title",
							selectCount: 0,
							author: "test author",
						},
						tags: [
							{
								id: 1,
								name: "test tag",
							},
						],
						serializedNodes: "test-serialized-nodes",
					},
					{
						content: "test content 2",
						language: "en",
						metadata: {
							description: "test description 2",
							title: "test title 2",
							selectCount: 0,
						},
						tags: [
							{
								id: 2,
								name: "test tag 2",
							},
						],
						serializedNodes: "test-serialized-nodes-2",
					},
				])
				.execute();
		});
		test("get all tutorials", async () => {
			const res = await testClient(app).admin.tutorials.$get();
			const json = await res.json();
			expect(json).toHaveLength(2);
			expect(json).toHaveProperty("[0].content", "test content");
			expect(json).toHaveProperty("[0].language", "en");
			expect(json).toHaveProperty("[0].metadata", {
				description: "test description",
				title: "test title",
				selectCount: 0,
			});
			expect(json).toHaveProperty("[0].tags", [
				{
					id: 1,
					name: "test tag",
				},
			]);
			expect(json).toHaveProperty(
				"[0].serializedNodes",
				"test-serialized-nodes",
			);
		});
	});

	describe("Get tutorial by ID", () => {
		let tutorialId: number;
		beforeEach(async () => {
			const result = await db
				.insert(tutorials)
				.values({
					content: "test content",
					language: "en",
					metadata: {
						description: "test description",
						title: "test title",
						selectCount: 0,
					},
					tags: [
						{
							id: 1,
							name: "test tag",
						},
					],
					serializedNodes: "test-serialized-nodes",
				})
				.returning({ id: tutorials.id })
				.execute();
			tutorialId = result[0].id;
		});
		test("get single tutorial by ID", async () => {
			const res = await testClient(app).admin.tutorials[":id"].$get({
				param: {
					id: String(tutorialId),
				},
			});
			const json = await res.json();
			console.log(json);
			expect(json).toHaveProperty("content", "test content");
			expect(json).toHaveProperty("language", "en");
			expect(json).toHaveProperty("metadata", {
				description: "test description",
				title: "test title",
				selectCount: 0,
			});
			expect(json).toHaveProperty("tags", [
				{
					id: 1,
					name: "test tag",
				},
			]);
			expect(json).toHaveProperty("serializedNodes", "test-serialized-nodes");
		});
	});

	describe("Delete tutorial by ID", () => {
		let tutorialId: number;
		beforeEach(async () => {
			const result = await db
				.insert(tutorials)
				.values([
					{
						content: "test content",
						language: "en",
						metadata: {
							description: "test description",
							title: "test title",
							selectCount: 0,
							author: "test author",
						},
						tags: [
							{
								id: 1,
								name: "test tag",
							},
						],
						serializedNodes: "test-serialized-nodes",
					},
					{
						content: "test content 2",
						language: "en",
						metadata: {
							description: "test description 2",
							title: "test title 2",
							selectCount: 0,
						},
						tags: [
							{
								id: 2,
								name: "test tag 2",
							},
						],
						serializedNodes: "test-serialized-nodes-2",
					},
				])
				.returning({ id: tutorials.id })
				.execute();
			tutorialId = result[0].id;
		});
		test("delete single tutorial by ID", async () => {
			const res = await testClient(app).admin.tutorials[":id"].$delete({
				param: {
					id: String(tutorialId),
				},
			});
			expect(res.status).toBe(200);

			const checkDeleted = await db.query.tutorials.findMany();
			// 2件登録しており、1件削除したので残るのは1件になる
			expect(checkDeleted).toHaveLength(1);
		});
	});

	describe("Create tutorial", () => {
		test("create a new tutorial", async () => {
			const res = await testClient(app).admin.tutorials.$post({
				json: {
					content: "test content",
					language: "en",
					metadata: {
						description: "test description",
						title: "test title",
						selectCount: 0,
						author: "test author",
					},
					tags: [
						{
							id: 1,
							name: "test tag",
						},
					],
					serializedNodes: "test-serialized-nodes",
				},
			});
			expect(res.status).toBe(200);
			const json = await res.json();
			expect(json).toHaveProperty("[0].id");
		});
	});

	describe("Update tutorial", () => {
		let tutorialId: number;
		beforeEach(async () => {
			const result = await db
				.insert(tutorials)
				.values({
					content: "test content",
					language: "en",
					metadata: {
						description: "test description",
						title: "test title",
						selectCount: 0,
					},
					tags: [
						{
							id: 1,
							name: "test tag",
						},
					],
					serializedNodes: "test-serialized-nodes",
				})
				.returning({ id: tutorials.id })
				.execute();
			tutorialId = result[0].id;
		});

		test("update a tutorial by ID", async () => {
			await testClient(app).admin.tutorials[":id"].$put({
				param: {
					id: String(tutorialId),
				},
				json: {
					content: "updated test content",
				},
			});
			/**
			 * 更新が反映されたか確認
			 */
			const result = await db.query.tutorials.findFirst({
				where: eq(tutorials.id, tutorialId),
			});
			console.log(result);
			expect(result).toHaveProperty("content", "updated test content");
		});
	});
});
