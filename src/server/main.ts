import express from "express";
import type { Express } from "express";
import expressWs from "express-ws";
import { verifyRequestOrigin } from "lucia";
import { lucia } from "./auth/index.js";
import api from "./apis.js";
import ViteExpress from "vite-express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { vmExpress } from "./session/websocket/vm/index.js";

// Initialize express and express-ws on the main app
const app = expressWs(express()).app;
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

let port = 3000;
if (process.env.PORT) {
	const basePort = Number.parseInt(process.env.PORT, 10); // 10進数として解釈
	if (!Number.isNaN(basePort)) {
		// basePortがNaNでないか確認
		port = basePort;
	}
}

app.use("/vm", vmExpress);
//expressが使えないので、http-proxy-middlewareを使ってアクセスする
// const vmProxy = createProxyMiddleware({
// 	target: `http://localhost:${(port + 1).toString()}`,
// 	changeOrigin: true,
// 	ws: true,
// });
// app.use("/vm", vmProxy);

//不正なwebsocketリクエストを拒否
app.ws("**", (ws, req) => {
	console.log("Invalid websocket request");
	ws.close();
});

ViteExpress.config({
	ignorePaths: /^\/api|^\/vm/,
});

export const server = app.listen(port, () =>
	console.log(`Main Server is listening with port: ${port}`),
);

ViteExpress.bind(app as unknown as Express, server);

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

export default app;
