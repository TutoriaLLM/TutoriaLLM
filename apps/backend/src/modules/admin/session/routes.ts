import { errorResponses, jsonBody } from "@/libs/openapi";
import {
	SessionValueListSchema,
	SessionValueListSchemaWithSort,
	deleteSessionParam,
	listSessionsQuery,
} from "@/modules/admin/session/schema";
import { createRoute } from "@hono/zod-openapi";

export const downloadAllSessions = createRoute({
	method: "get",
	path: "/admin/session/download",
	summary: "Download all sessions, by JSON format",
	responses: {
		200: {
			content: jsonBody(SessionValueListSchema),
			description: "Returns all sessions",
		},
		...errorResponses({}),
	},
});

export const listSessions = createRoute({
	method: "get",
	path: "/admin/session/list",
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

export const deleteSession = createRoute({
	method: "delete",
	path: "/admin/session/{sessionId}",
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
