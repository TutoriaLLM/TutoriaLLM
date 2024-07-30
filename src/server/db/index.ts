import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
import pg from "pg";
const client = new pg.Client({
	user: process.env.DB_USER || "postgres",
	password: process.env.DB_PASSWORD || "postgres",
	host: process.env.DB_HOST || "localhost",
	port: (process.env.DB_PORT as unknown as number) || 5432,
	database: process.env.DB_NAME || "code_tutorial_db",
	ssl: (process.env.DB_SSL as unknown as boolean) || false,
});
client.connect();

export const db = drizzle(client, { schema });
