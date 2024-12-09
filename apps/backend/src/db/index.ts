import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import pg from "pg";
const isProduction = process.env.NODE_ENV === "production";
const client = new pg.Client({
	user: process.env.POSTGRES_USER || "postgres",
	password: process.env.POSTGRES_PASSWORD || "postgres",
	host: process.env.DB_HOST || "localhost",
	port: (process.env.DB_PORT as unknown as number) || 5432,
	database: process.env.POSTGRES_DB || "tutoriallm_db",
	ssl: false,
});
client.connect();

export const db = drizzle(client, { schema });
