import type { HttpBindings } from "@hono/node-server";
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

export const vmProxy = createProxyMiddleware({
	target: `http://localhost:${vmPort}`,
	pathFilter: (path) => {
		return path.startsWith("/vm");
	},
	pathRewrite: { "^/vm": "" },
	changeOrigin: true,
	secure: false,
	ws: true,
	logger: console,
});

const app = new Hono<{ Bindings: HttpBindings }>().use("*", (c, next) => {
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
