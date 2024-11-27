import { createRoute } from "@hono/zod-openapi";
import {
	SessionValueListSchema,
	listSessionsQuery,
	deleteSessionParam,
	SessionValueListSchemaWithSort,
} from "./schema.js";
import { errorResponses, jsonBody } from "../../../libs/openapi";

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
	path: "/admin/session/{sessionCode}",
	summary: "Delete a session",
	request: {
		params: deleteSessionParam.schema,
	},
	responses: {
		200: {
			description: "Returns the session code",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [deleteSessionParam.vErr()],
		}),
	},
});
