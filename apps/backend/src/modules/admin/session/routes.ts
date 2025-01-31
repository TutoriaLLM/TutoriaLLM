import { errorResponses, jsonBody } from "@/libs/openapi";
import {
	SessionValueListSchema,
	SessionValueListSchemaWithSort,
	deleteSessionParam,
	findSessionFromUserIdParam,
	listSessionsQuery,
} from "@/modules/admin/session/schema";
import { createRoute } from "@hono/zod-openapi";

/**
 * Base config for admin session management
 */
const baseAdminSessionsConfig = {
	path: "/admin/session" as const,
	tags: ["admin-session"],
};

/**
 * Download all sessions, by JSON format
 */
export const downloadAllSessions = createRoute({
	...baseAdminSessionsConfig,
	method: "get",
	path: `${baseAdminSessionsConfig.path}/download`,
	summary: "Download all sessions, by JSON format",
	responses: {
		200: {
			content: jsonBody(SessionValueListSchema),
			description: "Returns all sessions",
		},
		...errorResponses({}),
	},
});

/**
 * Find list of sessions by userId
 */
export const findSessionFromUserId = createRoute({
	...baseAdminSessionsConfig,
	method: "get",
	path: `${baseAdminSessionsConfig.path}/list/{userId}`,
	summary: "Find list of sessions by userId",
	request: {
		query: listSessionsQuery.schema,
		params: findSessionFromUserIdParam.schema,
	},
	responses: {
		200: {
			content: jsonBody(SessionValueListSchemaWithSort),
			description: "Returns all sessions",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [findSessionFromUserIdParam.vErr()],
		}),
	},
});

/**
 * List all sessions, with pagination / sorting
 */
export const listSessions = createRoute({
	...baseAdminSessionsConfig,
	method: "get",
	path: `${baseAdminSessionsConfig.path}/list`,
	summary: "List all sessions, with pagination / sorting",
	request: {
		query: listSessionsQuery.schema,
	},
	responses: {
		200: {
			content: jsonBody(SessionValueListSchemaWithSort),
			description: "Returns all sessions",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [listSessionsQuery.vErr()],
		}),
	},
});

/**
 * Delete a session
 */
export const deleteSession = createRoute({
	...baseAdminSessionsConfig,
	method: "delete",
	path: `${baseAdminSessionsConfig.path}/{sessionId}`,
	summary: "Delete a session",
	request: {
		params: deleteSessionParam.schema,
	},
	responses: {
		200: {
			description: "Returns the session sessionId",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [deleteSessionParam.vErr()],
		}),
	},
});

/**
 * Delete all sessions by userId
 */
export const deleteSessionByUserId = createRoute({
	...baseAdminSessionsConfig,
	method: "delete",
	path: `${baseAdminSessionsConfig.path}/user/{userId}`,
	summary: "Delete all sessions by userId",
	request: {
		params: findSessionFromUserIdParam.schema,
	},
	responses: {
		200: {
			description: "Returns the session sessionId",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [findSessionFromUserIdParam.vErr()],
		}),
	},
});
