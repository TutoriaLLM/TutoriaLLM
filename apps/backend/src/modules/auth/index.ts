import { comparePasswordToHash } from "@/utils/password";
import { type User, users } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import type { Context } from "@/context";
import { zValidator } from "@hono/zod-validator";
import { z } from "@hono/zod-openapi";
import { lucia } from "@/libs/lucia";
import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "@/libs/default-hook";
import { errorResponse } from "@/libs/errors";

//ユーザーの認証を行い、存在した場合はCookieにセッションを保存する
export const app = new OpenAPIHono<Context>({ defaultHook });

app.get("/credential", (c, next) => {
	if (c.get("session")) {
		return errorResponse(c, {
			message: "Unauthorized",
			type: "UNAUTHORIZED",
		});
	}
	return c.json(c.get("session"));
});

app.post(
	"/login",
	zValidator(
		"json",
		z.object({
			username: z.string(),
			password: z.string(),
		}),
	),
	async (c, next) => {
		const { username, password } = c.req.valid("json");

		const existingUserQuery = await db
			.select()
			.from(users)
			.where(eq(users.username, username));
		const existingUser = existingUserQuery[0] as User | undefined;

		if (!existingUser) {
			return errorResponse(c, {
				message: "Unauthorized",
				type: "UNAUTHORIZED",
			});
		}

		const validPassword = await comparePasswordToHash(
			password,
			existingUser.password,
		);
		if (!validPassword) {
			return errorResponse(c, {
				message: "Unauthorized",
				type: "UNAUTHORIZED",
			});
		}

		const session = await lucia.createSession(existingUser.id, {});
		console.log("session created", session);
		c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
			append: true,
		});
		c.header("Location", "/", { append: true });
		return c.json({ message: "Success" }, 200);
	},
);

app.post("/logout", async (c, next) => {
	console.log("logout request");
	const session = c.get("session");
	if (!session) {
		return c.body(null, 401);
	}
	await lucia.invalidateSession(session.id);
	c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize());
	return c.json({ message: "ログアウトしました" });
});

export default app;
