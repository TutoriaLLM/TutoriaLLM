import { comparePasswordToHash } from "../../utils/password.js";
import { type User, users } from "../../db/schema.js";
import { db } from "../../db/index.js";
import { eq } from "drizzle-orm";
import type { Context } from "../../context.js";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { lucia } from "../../libs/lucia.js";
import { OpenAPIHono } from "@hono/zod-openapi";

//ユーザーの認証を行い、存在した場合はCookieにセッションを保存する
export const app = new OpenAPIHono<Context>();

app.get("/session", (c, next) => {
	if (c.get("session")) {
		return c.json({ message: "認証情報がありません" }, 401);
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

		try {
			const existingUserQuery = await db
				.select()
				.from(users)
				.where(eq(users.username, username));
			const existingUser = existingUserQuery[0] as User | undefined;

			if (!existingUser) {
				return c.json(
					{ message: "パスワードまたはユーザー名が間違っています" },
					401,
				);
			}

			const validPassword = await comparePasswordToHash(
				password,
				existingUser.password,
			);
			if (!validPassword) {
				return c.json(
					{ message: "パスワードまたはユーザー名が間違っています" },
					401,
				);
			}

			const session = await lucia.createSession(existingUser.id, {});
			console.log("session created", session);
			c.header(
				"Set-Cookie",
				lucia.createSessionCookie(session.id).serialize(),
				{ append: true },
			);
			c.header("Location", "/", { append: true });
			return c.redirect("/");
		} catch (error) {
			console.error("login error", error);
			return c.json({ message: "ログインに失敗しました" }, 500);
		}
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
