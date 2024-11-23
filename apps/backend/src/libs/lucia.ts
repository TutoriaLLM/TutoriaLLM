import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";

import { Lucia } from "lucia";
import { authSessions, type User, users } from "../db/schema.js";
import { db } from "../db/index.js";
declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		UserId: number;
	}
}
// 認証機能をセットアップ
const adapter = new DrizzlePostgreSQLAdapter(db, authSessions, users);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
		},
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username,
		};
	},
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: Omit<User, "id">;
	}
}
