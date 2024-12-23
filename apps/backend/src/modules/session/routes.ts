import { errorResponses, jsonBody } from "@/libs/openapi";
import {
	newSessionQuery,
	putSessionRequest,
	sessionParam,
	sessionValueSchema,
	sessionIdSchema,
} from "@/modules/session/schema";
import { createRoute } from "@hono/zod-openapi";

const newSession = createRoute({
	method: "post",
	path: "/session/new",
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
			validationErrorResnponseSchemas: [newSessionQuery.vErr()],
		}),
	},
});

const resumeSession = createRoute({
	method: "post",
	path: "/session/resume/{key}",
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
			validationErrorResnponseSchemas: [newSessionQuery.vErr()],
		}),
	},
});

const getSession = createRoute({
	method: "get",
	path: "/session/{key}",
	request: {
		params: sessionParam.schema,
	},
	responses: {
		200: {
			content: jsonBody(sessionValueSchema),
			description: "Returns the session data",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [sessionParam.vErr()],
		}),
	},
});

const putSession = createRoute({
	method: "put",
	path: "/session/{key}",
	request: {
		params: sessionParam.schema,
		body: {
			content: jsonBody(putSessionRequest.schema),
		},
	},
	responses: {
		200: {
			content: {
				"text/plain": {
					schema: {
						type: "string",
					},
				},
			},
			description: "Session updated",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [
				sessionParam.vErr(),
				putSessionRequest.vErr(),
			],
		}),
	},
});

const deleteSession = createRoute({
	method: "delete",
	path: "/session/{key}",
	request: {
		params: sessionParam.schema,
	},
	responses: {
		200: {
			content: {
				"text/plain": {
					schema: {
						type: "string",
					},
				},
			},
			description: "Session deleted",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [sessionParam.vErr()],
		}),
	},
});

export { newSession, resumeSession, getSession, putSession, deleteSession };
