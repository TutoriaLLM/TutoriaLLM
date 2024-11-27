import { OpenAPIHono } from "@hono/zod-openapi";
import { getStatus } from "./routes";
import { cors } from "hono/cors";

import type { Context } from "../../context";
import { defaultHook } from "../../libs/default-hook";

const app = new OpenAPIHono<Context>({ defaultHook })
	.openapi(getStatus, async (c) => {
		return c.text("OK!");
	})
	.use(cors());

export default app;
