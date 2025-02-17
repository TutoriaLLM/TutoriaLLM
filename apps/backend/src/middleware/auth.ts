import { createMiddleware } from "hono/factory";
import { errorResponse } from "@/libs/errors";
import type { auth } from "@/libs/auth";

export const verifyAuth = createMiddleware<{
	Variables: {
		user: typeof auth.$Infer.Session.user;
		session: typeof auth.$Infer.Session.session;
	};
}>(async (c, next) => {
	const isAuth = !!c.get("user") || !!c.get("session");
	if (!isAuth) {
		return errorResponse(c, {
			message: "Unauthorized",
			type: "UNAUTHORIZED",
		});
	}

	await next();
});
