import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";

//外部向けのヘルスチェック用エンドポイント
//CORSを許可しているので、外部からのアクセスも可能
const app = new OpenAPIHono();
// CORSを許可する
app.use(cors());

app.get("/", (c, next) => {
	return c.text("OK!");
});

export default app;
