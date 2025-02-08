import { describe, test, expect, beforeEach } from "vitest";
import { testClient } from "hono/testing";
import { setup } from "tests/test.helper";

// need to import after test.helper
import { inject } from "@/libs/inject";
import tutorialRoutes from "./index";
import { createHonoApp } from "@/create-app";
import { tags, type Tutorial, tutorials } from "@/db/schema";

const { db } = await setup();

const dummyTutorial = {
	id: 1,
	content: "This is a test tutorial",
	language: "en",
	metadata: {
		description: "This is a test tutorial",
		title: "Test Tutorial",
		selectCount: 0,
		author: "Test Author",
	},
	serializedNodes: "test",
	tags: [
		{
			id: 1,
			name: "Test Tag",
		},
	],
} satisfies Tutorial;

describe("Tutorials", () => {
	const app = createHonoApp().use(inject).route("/", tutorialRoutes);

	beforeEach(async () => {
		await db.insert(tutorials).values(dummyTutorial);
		await db.insert(tags).values({ name: dummyTutorial.tags[0].name });
	});

	test("GET /tutorials", async () => {
		const res = await testClient(app).tutorials.$get();

		const json = await res.json();

		//partial match
		expect(json).toContainEqual({
			id: dummyTutorial.id,
			language: dummyTutorial.language,
			metadata: dummyTutorial.metadata,
			tags: dummyTutorial.tags,
		});
	});

	test("GET /tags", async () => {
		const res = await testClient(app).tutorials.tags.$get();
		const json = await res.json();

		expect(json).toContainEqual(
			expect.objectContaining({
				name: dummyTutorial.tags[0].name,
			}),
		);
	});

	test("GET /tutorials/:id", async () => {
		const res = await testClient(app).tutorials[":id"].$get({
			param: { id: dummyTutorial.id.toString() },
		});

		const json = await res.json();

		expect(json).toEqual(dummyTutorial);
	});
});
