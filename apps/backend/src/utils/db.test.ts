import { describe, expect, test } from "vitest";
import { createDBUrl } from "./db";

describe("utils/db", () => {
	describe("createDBUrl", () => {
		const user = process.env.POSTGRES_USER;
		const password = process.env.POSTGRES_PASSWORD;
		const host = process.env.DB_HOST;
		const port = Number(process.env.DB_PORT);
		const db = process.env.POSTGRES_DB;
		const schema = process.env.DATABASE_SCHEMA || "public";
		test("should create url by environment variables", () => {
			expect(createDBUrl({})).toMatchInlineSnapshot(
				`"postgresql://${user}:${password}@${host}:${port}/${db}?schema=${schema}"`,
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
