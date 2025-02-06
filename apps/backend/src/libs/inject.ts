import { createMiddleware } from "hono/factory";
import type { Context, Database } from "@/context";
import { auth } from "./auth";
/**
 * Middleware for dependency injection
 * In the future, when the OpenAPI version of `factory.createApp` is implemented, use its initApp
 * @see https://github.com/honojs/middleware/issues/652
 */
export const inject = (db: Database) => {
	return createMiddleware<Context>(async (c, next) => {
		c.set("db", db);

		const session = await auth.api.getSession({ headers: c.req.raw.headers });

		if (session === null) {
			c.set("user", null);
			c.set("session", null);
			return next();
		}

		c.set("user", session.user);
		c.set("session", session.session);

		await next();
	});
};
