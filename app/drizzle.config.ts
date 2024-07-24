import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

export default defineConfig({
	schema: "./src/server/db/schema.ts",
	out: "./migrations",
	dialect: "postgresql",
	dbCredentials: {
		user: process.env.DB_USER || "postgres",
		password: process.env.DB_PASSWORD || "postgres",
		host: process.env.DB_HOST || "localhost",
		port: (process.env.DB_PORT as unknown as number) || 5432,
		database: process.env.DB_NAME || "code_tutorial_db",
		ssl: (process.env.SSL as unknown as boolean) || false,
	},
});
