import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

console.log("POSTGRES_USER:", process.env.POSTGRES_USER);
console.log("POSTGRES_PASSWORD:", process.env.POSTGRES_PASSWORD);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("POSTGRES_DB:", process.env.POSTGRES_DB);
export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./migrations",
	dialect: "postgresql",
	dbCredentials: {
		user: process.env.POSTGRES_USER || "postgres",
		password: process.env.POSTGRES_PASSWORD || "postgres",
		host: process.env.DB_HOST || "localhost",
		port: (process.env.DB_PORT as unknown as number) || 5432,
		database: process.env.POSTGRES_DB || "code_tutorial_db",
		ssl: (process.env.DB_SSL as unknown as boolean) || false,
	},
});
