import express from "express";
import expressWs from "express-ws";
import ViteExpress from "vite-express";

import admin from "./admin/index.js";
import auth from "./auth/index.js";
import session from "./session/index.js";

import { verifyRequestOrigin } from "lucia";
import { lucia } from "./auth/index.js";
import { vmExpress } from "./session/websocket/vm/index.js";
import tutorials from "./tutorials/index.js";

const app = express();

//Cookieの読み込み
app.use((req, res, next) => {
	if (req.method === "GET") {
		return next();
	}
	const originHeader = req.headers.origin ?? null;
	const hostHeader = req.headers.host ?? null;
	if (
		!originHeader ||
		!hostHeader ||
		!verifyRequestOrigin(originHeader, [hostHeader])
	) {
		return res.status(403).end();
	}
	return next();
});

app.use(async (req, res, next) => {
	const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");
	if (!sessionId) {
		res.locals.user = null;
		res.locals.session = null;
		return next();
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session?.fresh) {
		res.appendHeader(
			"Set-Cookie",
			lucia.createSessionCookie(session.id).serialize(),
		);
	}
	if (!session) {
		res.appendHeader(
			"Set-Cookie",
			lucia.createBlankSessionCookie().serialize(),
		);
	}
	res.locals.session = session;
	res.locals.user = user;
	return next();
});

expressWs(app);

//session routes
app.use("/session", session);

// Tutorial routes
app.use("/tutorial", tutorials);

//vm proxy
app.use("/vm", vmExpress);

//admin routes
app.use("/api/admin", admin);

//auth routes
app.use("/auth", auth);

ViteExpress.listen(app, 3000, () =>
	console.log("Server is listening on port 3000..."),
);
//メモリ監視
// メモリ使用量を一定時間おきに監視する関数
const monitorMemoryUsage = (interval: number) => {
	setInterval(() => {
		const memoryUsage = process.memoryUsage();
		console.log(
			`プロセスの総使用量: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
		);
		console.log("-------------------------");
	}, interval);
};
monitorMemoryUsage(5000);
