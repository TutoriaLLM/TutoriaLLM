import { OpenAPIHono } from "@hono/zod-openapi";

//外部向けのヘルスチェック用エンドポイント
const app = new OpenAPIHono();
app.get("/", (c, next) => {
	return c.text("OK!");
});

export default app;
