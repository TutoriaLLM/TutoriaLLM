import { jsonBody } from "@/libs/openapi";
import { AppConfigSchema } from "@/modules/admin/config/schema";
import { createRoute } from "@hono/zod-openapi";

/**
 * Base config for admin configuration management
 */
const baseAdminConfig = {
	path: "/admin/config" as const,
	tags: ["admin-config"],
};

/**
 * Update the app configuration
 */
export const updateConfigApp = createRoute({
	...baseAdminConfig,
	method: "post",
	path: `${baseAdminConfig.path}/update`,
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

/**
 * Get the app configuration
 */
export const getConfigApp = createRoute({
	...baseAdminConfig,
	method: "get",
	path: baseAdminConfig.path,
	summary: "Get the app configuration",
	responses: {
		200: {
			content: jsonBody(AppConfigSchema),
			description: "Returns the app configuration",
		},
	},
});
