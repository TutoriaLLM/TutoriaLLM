import { db } from "@/db";
import { betterAuth } from "better-auth";
import { admin, anonymous, username, openAPI } from "better-auth/plugins";

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
	plugins: [
		openAPI({
			disableDefaultReference: true,
		}),
		admin(),
		username(),
		anonymous({
			onLinkAccount: async ({ anonymousUser, newUser }) => {
				//データを移行する処理
			},
		}),
	],
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	emailAndPassword: {
		enabled: true,
	},
	trustedOrigins: [process.env.CORS_ORIGIN ?? "http://localhost:3000"],

	basePath: "/auth",
	onAPIError: {
		throw: true,
	},
});

export const createUser = async ({
	email,
	password,
	displayName,
	username,
}: {
	email: string;
	password: string;
	displayName: string;
	username: string;
}) => {
	const user = await auth.api.signUpEmail({
		body: {
			email,
			password,
			name: displayName,
			username: username,
		},
	});
	return user;
};

export const setRole = async ({
	userId,
	role,
}: {
	userId: string;
	role: "admin" | "user";
}) => {
	const result = await db
		.update(user)
		.set({
			role,
		})
		.where(eq(user.id, userId))
		.returning({
			id: user.id,
		});
	return result[0];
};
