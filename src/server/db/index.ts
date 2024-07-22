import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
import pg from "pg";
const client = new pg.Client({
	user: process.env.DATABASE_USER || "postgres",
	password: process.env.DATABASE_PASSWORD || "postgres",
	host: process.env.DATABASE_HOST || "localhost",
	port: 5432,
	database: process.env.DATABASE_NAME || "code_tutorial_db",
	ssl: process.env.NODE_ENV === "production",
});
client.connect();

export const db = drizzle(client, { schema });
