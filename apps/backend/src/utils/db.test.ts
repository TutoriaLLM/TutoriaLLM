import { describe, expect, test } from "vitest";
import { createDBUrl } from "./db";

describe("utils/db", () => {
	describe("createDBUrl", () => {
		test("should create url by environment variables", () => {
			expect(createDBUrl({})).toMatchInlineSnapshot(
				`"postgresql://test:1234@localhost:5432/test?schema=public"`,
			);
		});

		test("should create url by params", () => {
			expect(
				createDBUrl({
					user: "user",
					password: "password",
					host: "host",
					port: 5432,
					db: "db",
					schema: "schema",
				}),
			).toMatchInlineSnapshot(
				`"postgresql://user:password@host:5432/db?schema=schema"`,
			);
		});
	});
});
