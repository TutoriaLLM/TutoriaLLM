import { createRoute } from "@hono/zod-openapi";
import { AppConfigSchema } from "./schema.js";
import { jsonBody } from "../../libs/openapi.js";

const route = createRoute({
	method: "get",
	path: "/api/config",
	responses: {
		200: {
			content: jsonBody(AppConfigSchema),
			description: "Returns the app configuration",
		},
	},
});

export { route };
