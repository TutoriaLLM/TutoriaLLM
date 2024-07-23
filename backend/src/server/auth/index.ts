import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";

import express from "express";
import { Lucia } from "lucia";
import { comparePasswordToHash } from "../../utils/password.js";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { authSessions, type User, users } from "../db/schema.js";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";

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

//ユーザーの認証を行い、存在した場合はCookieにセッションを保存する
export const auth = express.Router();

auth.get("/session", (req, res) => {
	if (!res.locals.session) {
		return res.status(401).json({ message: "認証情報がありません" });
	}
	return res.json(res.locals.session);
});

auth.use(express.json()); // ここでJSONミドルウェアを追加します

auth.post("/login", async (req, res) => {
	console.log("login request", req.body);
	const { username, password } = req.body;

	try {
		const existingUserQuery = await db
			.select()
			.from(users)
			.where(eq(users.username, username));
		const existingUser = existingUserQuery[0] as User | undefined;

		if (!existingUser) {
			return res.status(401).json({ message: "ユーザーが見つかりません" });
		}

		const validPassword = await comparePasswordToHash(
			password,
			existingUser.password,
		);
		if (!validPassword) {
			return res.status(401).json({ message: "パスワードが違います" });
		}

		const session = await lucia.createSession(existingUser.id, {});
		console.log("session created", session);
		res
			.setHeader(
				"Set-Cookie",
				lucia.createSessionCookie(session.id).serialize(),
			)
			.setHeader("Location", "/")
			.redirect("/");
	} catch (error) {
		console.error("login error", error);
		return res.status(500).json({ message: "内部サーバーエラー" });
	}
});

auth.post("/logout", async (req, res) => {
	console.log("logout request");
	if (!res.locals.session) {
		return res.status(401).end();
	}
	await lucia.invalidateSession(res.locals.session.id);
	return res
		.setHeader(
			"Set-Cookie",
			`${lucia.createBlankSessionCookie().serialize()}; Max-Age=0`,
		)
		.status(200)
		.json({ message: "ログアウトしました" });
});

export default auth;
