import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

export default defineConfig({
	schema: "./src/server/db/schema.ts",
	out: "./migrations",
	dialect: "postgresql",
	dbCredentials: {
		user: process.env.DATABASE_USER || "postgres",
		password: process.env.DATABASE_PASSWORD || "postgres",
		host: process.env.DATABASE_HOST || "localhost",
		port: 5432,
		database: process.env.DATABASE_NAME || "code_tutorial_db",
		ssl: true,
	},
});
