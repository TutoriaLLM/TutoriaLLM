import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import type { Database } from "../../type.js";

//distが存在しない場合は作成する
import fs from "node:fs";
if (!fs.existsSync("dist")) {
	fs.mkdirSync("dist");
}

export const database = new SQLite("dist/database.db");
const dialect = new SqliteDialect({
	database: database,
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
	dialect,
});

// Create the tables if they don't exist
async function createTables() {
	await db.schema
		.createTable("users")
		.ifNotExists()
		.addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
		.addColumn("username", "varchar(255)", (col) => col.notNull())
		.addColumn("password", "varchar(255)", (col) => col.notNull())
		.execute();

	await db.schema
		.createTable("authSessions")
		.ifNotExists()
		.addColumn("id", "varchar(255)", (col) => col.primaryKey())
		.addColumn("expires_at", "integer", (col) => col.notNull())
		.addColumn("user_id", "integer", (col) =>
			col.references("users.id").onDelete("cascade").notNull(),
		)
		.execute();

	await db.schema
		.createTable("tutorials")
		.ifNotExists()
		.addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
		.addColumn("content", "text", (col) => col.notNull())
		.addColumn("metadata", "text", (col) => col.notNull()) // Storing JSON as text
		.execute();
}

// Call the function to create tables
createTables().catch((error) => {
	console.error(error);
});
