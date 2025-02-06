import { OpenAPIHono } from "@hono/zod-openapi";

// Health check endpoints for external use
const app = new OpenAPIHono();

app.get("/", (c) => {
	return c.json({ status: "ok" }, 200);
});

export default app;
