import type { HttpBindings } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Hono } from "hono";
import { createProxyMiddleware } from "http-proxy-middleware";
let vmPort = 3002;
if (process.env.VM_PORT) {
	const basePort = Number.parseInt(process.env.VM_PORT, 10); // 10進数として解釈
	if (!Number.isNaN(basePort)) {
		// basePortがNaNでないか確認
		vmPort = basePort;
	}
}

const vmProxy = createProxyMiddleware({
	target: `http://localhost:${vmPort}`,
	pathFilter: (path) => {
		return path.startsWith("/vm");
	},
	pathRewrite: { "^/vm": "" },
	changeOrigin: true,
	secure: false,
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

const app = new Hono<{ Bindings: HttpBindings }>().use("*", (c) => {
	console.log("vmProxy");
	return new Promise((resolve, reject) => {
		vmProxy(c.env.incoming, c.env.outgoing, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
});

export default app;
