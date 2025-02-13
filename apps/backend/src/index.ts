import "dotenv/config";
import { type Server as HttpServer, createServer } from "node:http";
import type { Socket } from "node:net";
import { errorResponse } from "@/libs/errors";
import adminRoutes from "@/modules/admin";
import configRoutes from "@/modules/config";
import healthRoutes from "@/modules/health";
import sessionRoutes from "@/modules/session";
import tutorialRoutes from "@/modules/tutorials";
import vmProxyRoutes, { vmProxy } from "@/modules/vmProxy";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";
import { initSocketServer } from "./modules/session/socket";
import { createHonoApp } from "./create-app";
import { auth } from "./libs/auth";
import { isErrorResult, merge } from "openapi-merge";
import type { Swagger } from "atlassian-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { AppErrorStatusCode } from "./libs/errors/config";
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

// app.use("*", async (c, next) => {
// 	if (c.req.method === "GET") {
// 		return next();
// 	}
// 	const originHeader = c.req.header("Origin") ?? null;
// 	const hostHeader = c.req.header("Host") ?? null;
// 	console.info("Origin Header:", originHeader);
// 	console.info("Host Header:", hostHeader);
// 	if (
// 		!(
// 			originHeader &&
// 			hostHeader &&
// 			verifyRequestOrigin(originHeader, [
// 				hostHeader,
// 				process.env.CORS_ORIGIN ?? "http://localhost:3000",
// 			])
// 		)
// 	) {
// 		console.info("Invalid origin");
// 		return c.body(null, 403);
// 	}
// 	await next();
// });

// app.use("*", async (c, next) => {
// 	const sessionId = lucia.readSessionCookie(c.req.header("Cookie") ?? "");
// 	if (!sessionId) {
// 		c.set("user", null);
// 		c.set("session", null);
// 		return next();
// 	}

// 	const { session, user } = await lucia.validateSession(sessionId);
// 	if (session?.fresh) {
// 		c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
// 			append: true,
// 		});
// 	}
// 	if (!session) {
// 		c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
// 			append: true,
// 		});
// 	}
// 	c.set("session", session);
// 	c.set("user", user);
// 	return next();
// });

let port = 3001;
if (process.env.SERVER_PORT) {
	const basePort = Number.parseInt(process.env.SERVER_PORT, 10); // Interpreted as a decimal number
	if (!Number.isNaN(basePort)) {
		// Check if basePort is not NaN
		port = basePort;
	}
}

export const server = serve({
	fetch: app.fetch,
	overrideGlobalObjects: false,
	port: port,
	createServer: createServer,
});

app.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw));

// Process executed after server startup
export const route = app
	.route("/", configRoutes)
	.route("/", healthRoutes)
	.route("/", sessionRoutes)
	.route("/", tutorialRoutes)
	.get(
		"/ui",
		apiReference({
			pageTitle: "TutoriaLLM API Reference",
			spec: {
				url: "/doc",
			},
		}),
	);

/**
 * Generate merged OpenAPI schema for documentation API and export it
 */
const authRef = (await auth.api.generateOpenAPISchema()) as Swagger.SwaggerV3;
const nonAuthRef = app.getOpenAPI31Document({
	openapi: "3.0.0",
	info: {
		version: "2.0.0",
		title: "TutoriaLLM API",
	},
}) as Swagger.SwaggerV3;
const mergeResult = merge([
	{
		oas: nonAuthRef,
	},
	{
		oas: authRef,
		pathModification: {
			prepend: "/auth",
		},
	},
]);

app.get("/doc", (c) => {
	if (isErrorResult(mergeResult)) {
		return c.body(JSON.stringify(c.error));
	}

	return c.body(JSON.stringify(mergeResult.output), 200);
});
app.route("/", adminRoutes);

// websocket proxy to vm is configured and handled directly on the server
server.on("upgrade", (req, socket, head) => {
	if (req.url?.startsWith("/vm")) {
		vmProxy.upgrade(req, socket as Socket, head);
	}
});

// Normal proxies are handled by routers
app.route("/vm", vmProxyRoutes);

/* *
 * Common handling of 404 errors
 */
app.notFound((c) => {
	console.info("not found");
	return errorResponse(c, {
		type: "NOT_FOUND",
		message: "Route not found",
	});
});

/* *
 * Common processing for server errors
 */
app.onError((err, c) => {
	// c.get("sentry").captureException(err);
	//exclude error message from better-auth
	if (c.req.url?.includes("/auth")) {
		//return error straight from better-auth
		const statusCode =
			"status" in err
				? AppErrorStatusCode[err.status as keyof typeof AppErrorStatusCode]
				: 500;
		console.info("error", err);
		const error = err as any;
		return c.json(
			{
				code: error.cause?.code || undefined,
				message: error.cause?.message || err.message || "Internal server error",
				status: statusCode,
				statusText: error.status || "UNAUTHORIZED",
			},
			statusCode,
		);
	}
	return errorResponse(c, {
		type: "SERVER_ERROR",
		message: "Internal server error",
		err,
	});
});

// Starting the socket.io server
initSocketServer(server as HttpServer);

const isDev = process.env.NODE_ENV === "development";

if (isDev) {
	console.info(`Ready on http://localhost:${port}`);
	console.info();

	showRoutes(app, { verbose: true, colorize: true });
}

export type AppType = typeof route;
