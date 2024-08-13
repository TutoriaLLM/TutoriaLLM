//debug
console.log("main.ts: Loading main app");

import express from "express";
import { verifyRequestOrigin } from "lucia";
import { lucia } from "./auth/index.js";
import ViteExpress from "vite-express";
import { EventEmitter } from "node:events";
import { createProxyMiddleware } from "http-proxy-middleware";
import { getConfig } from "./getConfig.js";
import { execSync } from "node:child_process";
import fs from "node:fs";
import https from "node:https";
import http from "node:http";

// SSL証明書の設定
const DOMAIN = process.env.DOMAIN || "example.com";
const EMAIL = process.env.EMAIL || "your-email@example.com";
const CERT_PATH = `/etc/letsencrypt/live/${DOMAIN}`;

// SSL証明書が存在しない場合は取得
if (!fs.existsSync(`${CERT_PATH}/fullchain.pem`)) {
	console.log("SSL証明書を取得しています...");
	execSync(
		`certbot certonly --standalone -d ${DOMAIN} --email ${EMAIL} --agree-tos --non-interactive`,
	);
}

// Initialize express and on the main app
const app = express();

// Load config
const config = getConfig();

// Cookieの読み込み
ViteExpress.config({
	ignorePaths: /^\/api|^\/vm/,
});

const isProduction = process.env.NODE_ENV === "production";

let httpPort = 80;
let httpsPort = 443;
let vmPort = 8080;
if (process.env.HTTP_PORT) {
	const basePort = Number.parseInt(process.env.HTTP_PORT, 10); // 10進数として解釈
	if (!Number.isNaN(basePort)) {
		httpPort = basePort;
	}
}
if (process.env.HTTPS_PORT) {
	const basePort = Number.parseInt(process.env.HTTPS_PORT, 10); // 10進数として解釈
	if (!Number.isNaN(basePort)) {
		httpsPort = basePort;
	}
}
if (process.env.VM_PORT) {
	const basePort = Number.parseInt(process.env.VM_PORT, 10); // 10進数として解釈
	if (!Number.isNaN(basePort)) {
		vmPort = basePort;
	}
}

const serverEmitter = new EventEmitter();

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

// HTTPS server options
const httpsOptions = {
	key: fs.readFileSync(`${CERT_PATH}/privkey.pem`),
	cert: fs.readFileSync(`${CERT_PATH}/fullchain.pem`),
};

// HTTPSサーバーの起動
const httpsServer = https.createServer(httpsOptions, app).listen(443, () => {
	console.log(`HTTPS Server running on port ${process.env.HTTPS_PORT}`);
	serverEmitter.emit("server-started");
});

// HTTPサーバーの起動
const httpServer = http.createServer(app).listen(80, () => {
	console.log(`HTTP Server running on port ${process.env.HTTP_PORT}`);
});

// ViteExpressのバインド
if (isProduction) {
	ViteExpress.bind(app, httpsServer);
}
ViteExpress.bind(app, httpServer);

// メモリ監視
const monitorMemoryUsage = (interval: number) => {
	setInterval(() => {
		const memoryUsage = process.memoryUsage();
		console.log(
			`プロセスの総使用量: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
		);
		console.log("-------------------------");
	}, interval);
};
if (config.General_Settings.Enable_Memory_Use_Log === true) {
	monitorMemoryUsage(2000);
}

process.on("uncaughtException", (err) => {
	console.log(err);
});

serverEmitter.on("server-started", () => {
	console.log("Server started ----- routes will be added");
	// APIなどのルーティングをサーバー起動後に追加
	import("./apis.js").then((api) => {
		app.use("/api", api.default);
		console.log("API routes added");
	});

	// VMのプロキシ設定 (/vm以下のパスはHTTPでもHTTPSでもアクセス可能)
	const vmProxy = createProxyMiddleware({
		target: `http://localhost:${vmPort}`,
		pathFilter: (path) => {
			return path.startsWith("/vm");
		},
		pathRewrite: { "^/vm": "" },
		changeOrigin: true,
		ws: true,
		logger: console,
		on: {
			close: (res, socket, head) => {
				console.log("root close");
			},
			proxyReq: (proxyReq, req, res) => {
				console.log("root proxyReq");
			},
			error: (err, req, res) => {
				console.log("root error on proxy", err);
			},
			proxyReqWs: (proxyReq, req, socket, options, head) => {
				console.log("root proxyReqWs");
			},
		},
	});
	app.use(vmProxy);
});

export { app, httpsServer, httpServer, vmPort, serverEmitter };
