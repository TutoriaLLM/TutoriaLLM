import { OpenAPIHono } from "@hono/zod-openapi";

//外部向けのヘルスチェック用エンドポイント
const app = new OpenAPIHono();
app.get("/", (c, next) => {
	return c.json({ status: "ok" }, 200);
});

export default app;
