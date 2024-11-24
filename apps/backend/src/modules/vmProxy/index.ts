import { OpenAPIHono } from "@hono/zod-openapi";
const app = new OpenAPIHono();

let vmPort = 3001;
if (process.env.VM_PORT) {
	const basePort = Number.parseInt(process.env.VM_PORT, 10); // 10進数として解釈
	if (!Number.isNaN(basePort)) {
		// basePortがNaNでないか確認
		vmPort = basePort;
	}
}

app.get("*", (c) => {
	return fetch(`http://localhost:${vmPort}/`, c.req);
});

export default app;
