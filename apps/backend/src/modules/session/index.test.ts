import { describe, test, beforeEach, expect } from "vitest";
import { testClient } from "hono/testing";
import { setup } from "tests/test.helper";

// need to import after test.helper
import { inject } from "@/libs/inject";
import sessionRoutes from "./index";
import { createHonoApp } from "@/create-app";
import type { AppSession } from "@/db/schema";

const { createUser } = await setup();

describe("Sessions", () => {
	beforeEach(async () => {
		await createUser();
	});
	let sessionId = "test-session-id";
	let sessionValue: AppSession;

	const app = createHonoApp().use(inject).route("/", sessionRoutes);

	test("new session", async () => {
		const res = await testClient(app).session.new.$post({
			query: {
				language: "en",
			},
		});

		const json = await res.json();
		console.log(json);
		expect(json).toHaveProperty("sessionId");
		if ("sessionId" in json) {
			sessionId = json.sessionId;
		}
	});

	// THIS TEST IS FAILING
	//DB does not keep the session data between test cases. should be fixed.
	test("resume session with existing id", async () => {
		console.log("session id", sessionId);
		const res = await testClient(app).session.resume[":key"].$post({
			param: {
				key: sessionId,
			},
		});

		const json = await res.json();
		console.log(json);
		expect(json).toHaveProperty("sessionId");
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

	test("get session by id", async () => {
		const res = await testClient(app).session[":key"].$get({
			param: {
				key: sessionId,
			},
		});

		const json = await res.json();
		expect(json).toHaveProperty(["sessionId", "uuid"]);
		if ("sessionId" in json) {
			sessionValue = {
				...json,
				//userInfo can be a string or an object
				userInfo:
					json.userInfo &&
					typeof json.userInfo === "object" &&
					"id" in json.userInfo
						? json.userInfo.id
						: json.userInfo,
			};
		}
	});

	test("update session", async () => {
		const date = new Date().toISOString();
		const res = await testClient(app).session[":key"].$put({
			param: {
				key: sessionId,
			},
			json: {
				...sessionValue,
				updatedAt: date,
			},
		});

		const json = await res.json();
		expect(json).toHaveProperty("sessionId");

		// Check if the session was updated
		const updatedSession = await testClient(app).session[":key"].$get({
			param: {
				key: sessionId,
			},
		});
		const updatedJson = await updatedSession.json();
		expect(updatedJson).toHaveProperty("updatedAt", date);
	});
});
