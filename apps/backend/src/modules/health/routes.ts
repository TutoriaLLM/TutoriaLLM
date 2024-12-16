import { jsonBody } from "@/libs/openapi";
import { StatusCheckSchema } from "@/modules/health/schema";
import { createRoute } from "@hono/zod-openapi";

export const getStatus = createRoute({
	method: "get",
	path: "/status",
	summary: "Return 200 when server is running",
	responses: {
		200: {
			content: jsonBody(StatusCheckSchema),
			description: "Server is running",
		},
	},
});
