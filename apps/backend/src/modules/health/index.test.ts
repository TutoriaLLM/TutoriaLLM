import { describe, expect, test } from "vitest";
import app from "./index";
import { testClient } from "hono/testing";

describe("Health Check Endpoint", () => {
	test("GET /status", async () => {
		const res = await testClient(app).status.$get();
		const json = await res.json();
		expect(json).toEqual({ status: "ok" });
	});
});
