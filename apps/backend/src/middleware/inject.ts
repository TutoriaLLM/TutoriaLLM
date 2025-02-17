import { createMiddleware } from "hono/factory";
import type { Context } from "@/context";
import { auth } from "@/libs/auth";
import { db } from "@/db";

/**
 * Middleware for dependency injection
 * In the future, when the OpenAPI version of `factory.createApp` is implemented, use its initApp
 * @see https://github.com/honojs/middleware/issues/652
 */
export const inject = createMiddleware<Context>(async (c, next) => {
	if (!c.get("db")) {
		c.set("db", db);
	}

	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!(session?.user && session?.session)) {
		c.set("user", null);
		c.set("session", null);
		return next();
	}

	c.set("user", session.user);
	c.set("session", session.session);

	await next();
});
