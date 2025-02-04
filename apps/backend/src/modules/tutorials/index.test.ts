import { beforeEach, describe, test, expect } from "vitest";
import { testClient } from "hono/testing";
import { setup } from "tests/test.helper";

// need to import after test.helper
import app from "./index";

const { db } = await setup();

describe("Tutorials", () => {
	beforeEach(async () => {});

	test("GET /tutorials", async () => {
		const res = await testClient(app).tutorials.$get();
		console.log(res);

		const json = await res.json();

		expect(json).toEqual({ hello: "world" });
	});
});
