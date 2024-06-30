import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import { database } from "../db/index.js";
import type { User } from "../../type.js";
import express from "express";
import { comparePasswordToHash } from "../../utils/password.js";

// 認証機能をセットアップ
const adapter = new BetterSqlite3Adapter(database, {
  user: "users", // Correct table name
  session: "authSessions", // Correct table name
});

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

  const existingUser = database
    .prepare("SELECT * FROM users WHERE username = ?") // Correct table name
    .get(username) as User | undefined;
  if (!existingUser) {
    return res.status(401).json({ message: "ユーザーが見つかりません" });
  }

  const validPassword = await comparePasswordToHash(
    password,
    existingUser.password
  );
  if (!validPassword) {
    return res.status(401).json({ message: "パスワードが違います" });
  }

  const session = await lucia.createSession(existingUser.id.toString(), {});
  console.log("session created", session);
  res
    .setHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize())
    .setHeader("Location", "/")
    .redirect("/");
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
      lucia.createBlankSessionCookie().serialize() + "; Max-Age=0"
    )
    .status(200)
    .json({ message: "ログアウトしました" });
});

export default auth;
