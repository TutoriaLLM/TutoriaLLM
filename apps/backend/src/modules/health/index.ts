import { OpenAPIHono } from "@hono/zod-openapi";
import { getStatus } from "./routes";
import { cors } from "hono/cors";

const app = new OpenAPIHono()
	.openapi(getStatus, async (c) => {
		return c.text("OK!");
	})
	.use(cors());

export default app;
