import { DockerComposeEnvironment, Wait } from "testcontainers";
import { createDBUrl } from "@/utils/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import { sql } from "drizzle-orm";
import type { Database } from "@/context";
import pg from "pg";
export async function setupDB({ port }: { port: "random" | number }) {
	const container = await new DockerComposeEnvironment(
		".",
		"docker-compose.yml",
	)
		.withEnvironmentFile("./apps/backend/.env.test")
		// overwrite environment variables
		.withEnvironment({
			DB_PORT: port === "random" ? "0" : `${port}`,
		})
		.withWaitStrategy("db", Wait.forListeningPorts())
		.up(["db"]);
	const dbContainer = container.getContainer("db-1");

	// これで実際にhost側にbindされたランダムなポートを得る
	const mappedPort = dbContainer.getMappedPort(5432);

	const url = createDBUrl({
		host: dbContainer.getHost(),
		port: mappedPort,
	});

	const pool = new pg.Pool({
		connectionString: url,
	});

	const db = drizzle(pool, { schema });

	await migrate(db, {
		migrationsFolder: "./apps/backend/migrations",
	});

	async function down() {
		await pool.end();
		await container.down();
	}

	return <const>{
		container,
		port,
		db,
		truncate: () => truncate(db),
		down,
		async [Symbol.asyncDispose]() {
			await down();
		},
	};
}

export async function truncate(db: Database) {
	const query = sql<string>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `;

	const tables = await db.execute(query); // retrieve tables

	for (const table of tables.rows) {
		// テーブル名をダブルクォートで囲む
		const tableName = table.table_name;
		const query = sql.raw(
			`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`,
		);
		await db.execute(query); // テーブル内の全データを削除
	}
}
