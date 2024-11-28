import { serve } from "@hono/node-server";
import { showRoutes } from "hono/dev";
import { verifyRequestOrigin } from "lucia";
import { lucia } from "./libs/lucia.js";
import type { Context } from "./context.js";
import authRoutes from "./modules/auth";
import configRoutes from "./modules/config";
import vmProxyRoutes from "./modules/vmProxy";
import sessionRoutes from "./modules/session";
import healthRoutes from "./modules/health";
import tutorialRoutes from "./modules/tutorials";
import adminRoutes from "./modules/admin";

import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { errorResponse } from "./libs/errors";
import EventEmitter from "node:events";
import { defaultHook } from "./libs/default-hook.js";

const app = new OpenAPIHono<Context>({ defaultHook });
export const serverEmitter = new EventEmitter();
const isDev = process.env.NODE_ENV === "development";
app.use("*", async (c, next) => {
	if (c.req.method === "GET") {
		return next();
	}
	const originHeader = c.req.header("Origin") ?? null;
	const hostHeader = c.req.header("Host") ?? null;
	if (
		!originHeader ||
		!hostHeader ||
		!verifyRequestOrigin(originHeader, [hostHeader])
	) {
		return c.body(null, 403);
	}
	return next();
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

app.get("/", (c) => c.text("Hello Node.js!"));

app.route("/", vmProxyRoutes);

let port = 3000;
if (process.env.SERVER_PORT) {
	const basePort = Number.parseInt(process.env.SERVER_PORT, 10); // 10進数として解釈
	if (!Number.isNaN(basePort)) {
		// basePortがNaNでないか確認
		port = basePort;
	}
}

export const server = serve(
	{
		fetch: app.fetch,
		port: port,
	},
	startServer,
);

function startServer() {
	serverEmitter.emit("server-started", server);
}

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
/**
 * 404エラー時の共通処理
 */
app.notFound((c) => {
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

if (isDev) showRoutes(app, { verbose: true, colorize: true });

export type AppType = typeof route;
