import type { Env } from "hono";
import type { auth } from "@/libs/auth";
import type { NodePgClient, NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@/db/schema";

export type Database = NodePgDatabase<typeof schema> & {
	$client: NodePgClient;
};
export interface Context extends Env {
	Variables: {
		db: Database;
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null;
	};
}
