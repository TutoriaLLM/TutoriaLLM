import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";

import { db } from "@/db";
import { type User, authSessions, users } from "@/db/schema";
import { Lucia } from "lucia";
declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		UserId: number;
	}
}
// Set up authentication functionality
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
