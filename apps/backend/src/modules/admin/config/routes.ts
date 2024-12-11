import { createRoute } from "@hono/zod-openapi";
import { AppConfigSchema } from "@/modules/admin/config/schema";
import { jsonBody } from "@/libs/openapi";

const updateConfigApp = createRoute({
	method: "post",
	path: "/admin/config/update",
	summary: "Update the app configuration",
	request: {
		body: {
			content: jsonBody(AppConfigSchema),
		},
	},
	responses: {
		200: {
			description: "Config updated",
			content: jsonBody(AppConfigSchema),
		},
	},
});

const getConfigApp = createRoute({
	method: "get",
	path: "/admin/config",
	responses: {
		200: {
			content: jsonBody(AppConfigSchema),
			description: "Returns the app configuration",
		},
	},
});

export { updateConfigApp, getConfigApp };
