import { DockerComposeEnvironment, Wait } from "testcontainers";
import { createDBUrl } from "@/utils/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import { sql } from "drizzle-orm";
import type { Database } from "@/context";

export async function setupDB({ port }: { port: "random" | number }) {
	const container = await new DockerComposeEnvironment(".", "compose.yml")
		.withEnvironmentFile(".env.test")
		// overwrite environment variables
		.withEnvironment({
			DATABASE_PORT: port === "random" ? "0" : `${port}`,
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

	const db = drizzle(url, { schema });

	await migrate(db, {
		migrationsFolder: "./migrations",
	});

	async function down() {
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
	const query = sql<string>`SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `;

	const tables = await db.execute(query); // retrieve tables

	for (const table of tables) {
		const query = sql.raw(`TRUNCATE TABLE ${table.table_name} CASCADE;`);
		await db.execute(query); // Truncate (clear all the data) the table
	}
}
