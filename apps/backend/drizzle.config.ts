import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

export default defineConfig({
	schema: "./src/db/schema",
	out: "./migrations",
	dialect: "postgresql",
	dbCredentials: {
		user: process.env.POSTGRES_USER || "postgres",
		password: process.env.POSTGRES_PASSWORD || "postgres",
		host: process.env.DB_HOST || "localhost",
		port: (process.env.DB_PORT as unknown as number) || 5432,
		database: process.env.POSTGRES_DB || "tutoriallm_db",
		ssl: (process.env.DB_SSL as unknown as boolean) || false,
	},
});
