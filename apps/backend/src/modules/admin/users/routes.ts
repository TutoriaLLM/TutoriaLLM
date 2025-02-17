import { createRoute } from "@hono/zod-openapi";
import {
	updateUserDetailRequest,
	userDetailParam,
	userDetailSchema,
	userIdSchema,
} from "./schema";
import { errorResponses, jsonBody } from "@/libs/openapi";

/**
 * Base admin users config
 */
const baseAdminUsersConfig = {
	path: "/admin/users" as const,
	tags: ["admin-users"],
};

/**
 * Get user's detailed information from id
 */
export const userDetailFromId = createRoute({
	...baseAdminUsersConfig,
	method: "get",
	path: `${baseAdminUsersConfig.path}/{id}`,
	summary: "Get user's detailed information from id",
	request: {
		params: userDetailParam.schema,
	},
	responses: {
		200: {
			content: jsonBody(userDetailSchema),
			description: "Returns the user's detailed information",
		},
		...errorResponses({
			validationErrorResponseSchemas: [userDetailParam.vErr()],
		}),
	},
});

/**
 * Update user's detailed information manually instead of Better-auth
 */
export const updateUserDetail = createRoute({
	...baseAdminUsersConfig,
	method: "put",
	path: `${baseAdminUsersConfig.path}/{id}`,
	summary: "Update user's detailed information",
	request: {
		params: userDetailParam.schema,
		body: {
			content: jsonBody(updateUserDetailRequest.schema),
		},
	},
	responses: {
		200: {
			content: jsonBody(userIdSchema),
			description: "Returns the updated user's detailed information",
		},
		...errorResponses({
			validationErrorResponseSchemas: [userDetailParam.vErr()],
		}),
	},
});
