import { errorResponses, jsonBody } from "@/libs/openapi";
import {
	newSessionQuery,
	putSessionRequest,
	sessionParam,
	sessionValueSchema,
	sessionIdSchema,
	listSessionValueSchema,
} from "@/modules/session/schema";
import { createRoute } from "@hono/zod-openapi";

const baseSessionsConfig = {
	path: "/session" as const,
	tags: ["session"],
};

/**
 * Create a new session, from the provided session data
 */
export const newSession = createRoute({
	...baseSessionsConfig,
	method: "post",
	path: `${baseSessionsConfig.path}/new`,
	summary: "Create a new session, from the provided session data",
	request: {
		query: newSessionQuery.schema,
	},
	responses: {
		200: {
			content: jsonBody(sessionIdSchema),
			description: "Returns the session id",
		},
		...errorResponses({
			validationErrorResponseSchemas: [newSessionQuery.vErr()],
		}),
	},
});

/**
 * Resume a session, from the provided session data
 */
export const resumeSession = createRoute({
	...baseSessionsConfig,
	method: "post",
	path: `${baseSessionsConfig.path}/resume/{key}`,
	summary: "Resume a session, from the provided session data",
	request: {
		params: sessionParam.schema,
	},
	responses: {
		200: {
			content: jsonBody(sessionIdSchema),
			description:
				"Returns the session id. If the session provided, it will return the session id to continue the session from existing session, or create a new session based on the provided data.",
		},
		...errorResponses({
			validationErrorResponseSchemas: [newSessionQuery.vErr()],
		}),
	},
});

/**
 * Get a session by its key
 */
export const getSession = createRoute({
	...baseSessionsConfig,
	method: "get",
	path: `${baseSessionsConfig.path}/{key}`,
	summary: "Get a session by its key",
	request: {
		params: sessionParam.schema,
	},
	responses: {
		200: {
			content: jsonBody(sessionValueSchema),
			description: "Returns the session data",
		},
		...errorResponses({
			validationErrorResponseSchemas: [sessionParam.vErr()],
		}),
	},
});

/**
 * Get all sessions belonging to the current user
 */
export const getUserSessions = createRoute({
	...baseSessionsConfig,
	method: "get",
	path: baseSessionsConfig.path,
	summary: "Get all sessions belonging to the current user",
	responses: {
		200: {
			content: jsonBody(listSessionValueSchema),
			description:
				"Returns the user's sessions based on the user's token(auth)",
		},
		...errorResponses({}),
	},
});

/**
 * Update a session by its key
 */
export const putSession = createRoute({
	...baseSessionsConfig,
	method: "put",
	path: `${baseSessionsConfig.path}/{key}`,
	summary: "Update a session by its key",
	request: {
		params: sessionParam.schema,
		body: {
			content: jsonBody(putSessionRequest.schema),
		},
	},
	responses: {
		200: {
			content: jsonBody(sessionIdSchema),
			description: "Session updated",
		},
		...errorResponses({
			validationErrorResponseSchemas: [
				sessionParam.vErr(),
				putSessionRequest.vErr(),
			],
		}),
	},
});

/**
 * Delete a session by its key
 */
export const deleteSession = createRoute({
	...baseSessionsConfig,
	method: "delete",
	path: `${baseSessionsConfig.path}/{key}`,
	summary: "Delete a session by its key",
	request: {
		params: sessionParam.schema,
	},
	responses: {
		200: {
			content: jsonBody(sessionIdSchema),
			description: "Session deleted",
		},
		...errorResponses({
			validationErrorResponseSchemas: [sessionParam.vErr()],
		}),
	},
});
