import { db } from "@/db";
import { betterAuth } from "better-auth";
import { admin, anonymous, username, openAPI } from "better-auth/plugins";

import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
	plugins: [
		openAPI(),
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
