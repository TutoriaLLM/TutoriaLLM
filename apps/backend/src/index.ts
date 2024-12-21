import "dotenv/config";
import { type Server as HttpServer, createServer } from "node:http";
import type { Socket } from "node:net";
import { errorResponse } from "@/libs/errors";
import { lucia } from "@/libs/lucia";
import adminRoutes from "@/modules/admin";
import authRoutes from "@/modules/auth";
import configRoutes from "@/modules/config";
import healthRoutes from "@/modules/health";
import sessionRoutes from "@/modules/session";
import tutorialRoutes from "@/modules/tutorials";
import vmProxyRoutes, { vmProxy } from "@/modules/vmProxy";
import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";
import { verifyRequestOrigin } from "lucia";
import { initSocketServer } from "./modules/session/socket";
import { createHonoApp } from "./create-app";

const app = createHonoApp();

app.use(
	"*",
	cors({
		origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		credentials: true,
	}),
);

app.use("*", async (c, next) => {
	if (c.req.method === "GET") {
		return next();
	}
	const originHeader = c.req.header("Origin") ?? null;
	const hostHeader = c.req.header("Host") ?? null;
	console.info("Origin Header:", originHeader);
	console.info("Host Header:", hostHeader);
	if (
		!(
			originHeader &&
			hostHeader &&
			verifyRequestOrigin(originHeader, [
				hostHeader,
				process.env.CORS_ORIGIN ?? "http://localhost:3000",
			])
		)
	) {
		console.info("Invalid origin");
		return c.body(null, 403);
	}
	await next();
});

app.use("*", async (c, next) => {
	const sessionId = lucia.readSessionCookie(c.req.header("Cookie") ?? "");
	if (!sessionId) {
		c.set("user", null);
		c.set("session", null);
		return next();
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session?.fresh) {
		c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
			append: true,
		});
	}
	if (!session) {
		c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
			append: true,
		});
	}
	c.set("session", session);
	c.set("user", user);
	return next();
});

let port = 3001;
if (process.env.SERVER_PORT) {
	const basePort = Number.parseInt(process.env.SERVER_PORT, 10); // 10進数として解釈
	if (!Number.isNaN(basePort)) {
		// basePortがNaNでないか確認
		port = basePort;
	}
}

export const server = serve({
	fetch: app.fetch,
	overrideGlobalObjects: false,
	port: port,
	createServer: createServer,
});

//サーバー起動後に実行される処理
export const route = app
	.route("/", authRoutes)
	.route("/", configRoutes)
	.route("/", healthRoutes)
	.route("/", sessionRoutes)
	.route("/", tutorialRoutes)
	.doc("/doc", {
		openapi: "3.0.0",
		info: {
			version: "1.0.0",
			title: "TutoriaLLM API",
		},
	})
	.get("/ui", swaggerUI({ url: "/doc" }));

// The OpenAPI documentation will be available at /doc
app.route("/", adminRoutes);

//vmに対するwebsocketプロキシは、サーバーに直接設定し、処理する
server.on("upgrade", (req, socket, head) => {
	if (req.url?.startsWith("/vm")) {
		vmProxy.upgrade(req, socket as Socket, head);
	}
});

//通常のプロキシはルーターで処理
app.route("/vm", vmProxyRoutes);

/**
 * 404エラー時の共通処理
 */
app.notFound((c) => {
	console.error("not found");
	return errorResponse(c, {
		type: "NOT_FOUND",
		message: "Route not found",
	});
});

/**
 * サーバーエラー時の共通処理
 */
app.onError((err, c) => {
	// c.get("sentry").captureException(err);
	return errorResponse(c, {
		type: "SERVER_ERROR",
		message: "Unexpected error",
		err,
	});
});

//socket.ioサーバーの起動
initSocketServer(server as HttpServer);

const isDev = process.env.NODE_ENV === "development";

if (isDev) showRoutes(app, { verbose: true, colorize: true });

export type AppType = typeof route;
