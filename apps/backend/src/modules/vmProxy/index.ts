import { OpenAPIHono } from "@hono/zod-openapi";
import { Hono } from "hono";
let vmPort = 3002;
if (process.env.VM_PORT) {
	const basePort = Number.parseInt(process.env.VM_PORT, 10); // 10進数として解釈
	if (!Number.isNaN(basePort)) {
		// basePortがNaNでないか確認
		vmPort = basePort;
	}
}
const app = new Hono().get("*", (c) => {
	console.log("Proxying to VM", vmPort);
	// https:.../vm/を正規表現で削除してパスを作成
	const newPath = c.req.path.replace(/^\/vm\//, "/");
	console.log("path", newPath);
	return fetch(`http://localhost:${vmPort}${newPath}`, c.req);
});

export default app;
