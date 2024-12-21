import { jsonBody } from "@/libs/openapi";
import { AppConfigSchema } from "@/modules/config/schema";
import { createRoute } from "@hono/zod-openapi";

const route = createRoute({
	method: "get",
	path: "/config",
	responses: {
		200: {
			content: jsonBody(AppConfigSchema),
			description: "Returns the app configuration",
		},
	},
});

export { route };
