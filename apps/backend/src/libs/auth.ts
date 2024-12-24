import { db } from "@/db";
import { betterAuth } from "better-auth";
import { admin, anonymous, username } from "better-auth/plugins";

import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
	plugins: [admin(), username(), anonymous()],
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	emailAndPassword: {
		enabled: true,
	},
	trustedOrigins: [process.env.CORS_ORIGIN ?? "http://localhost:3000"],
	basePath: "/auth",
	onAPIError: {
		onError: (error) => {
			console.error(error);
			throw error;
		},
	},
});
