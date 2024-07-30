import express from "express";
import type { Express } from "express";
import expressWs from "express-ws";
import { verifyRequestOrigin } from "lucia";
import { lucia } from "./auth/index.js";
import api from "./apis.js";
import ViteExpress from "vite-express";

// Initialize express and express-ws on the main app
const { app } = expressWs(express());

// Cookieの読み込み
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

app.use("/api", api);

//不正なwebsocketリクエストを拒否
app.ws("**", (ws, req) => {
	console.log("Invalid websocket request");
	ws.close();
});

ViteExpress.config({
	ignorePaths: /^\/api/,
});

let port = process.env.PORT as unknown as number;
if (!port) {
	port = 3000;
}

ViteExpress.listen(app as unknown as Express, port, () =>
	console.log(`Server is listening with port: ${port}`),
);

// メモリ監視
// const monitorMemoryUsage = (interval: number) => {
// 	setInterval(() => {
// 		const memoryUsage = process.memoryUsage();
// 		console.log(
// 			`プロセスの総使用量: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
// 		);
// 		console.log("-------------------------");
// 	}, interval);
// };
// monitorMemoryUsage(5000);
process.on("uncaughtException", (err) => {
	console.log(err);
});
