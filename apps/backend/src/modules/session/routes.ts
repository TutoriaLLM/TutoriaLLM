import { createRoute } from "@hono/zod-openapi";
import {
	sessionParam,
	newSessionQuery,
	newSessionRequest,
	sessionCodeSchema,
	putSessionRequest,
	sessionValueSchema,
} from "./schema.js";
import { errorResponses, jsonBody } from "../../libs/openapi.js";

const newSession = createRoute({
	method: "post",
	path: "/session/new",
	summary: "Create a new session, from the provided session data",
	request: {
		query: newSessionQuery.schema,
	},
	responses: {
		200: {
			content: {
				"text/plain": {
					schema: sessionCodeSchema,
				},
			},
			description: "Returns the session id",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [newSessionQuery.vErr()],
		}),
	},
});

const resumeSession = createRoute({
	method: "post",
	path: "/session/resume",
	summary: "Resume a session, from the provided session data",
	request: {
		body: {
			content: jsonBody(newSessionRequest.schema),
		},
	},
	responses: {
		200: {
			content: {
				"text/plain": {
					schema: sessionCodeSchema,
				},
			},
			description:
				"Returns the session id. If the session provided, it will return the session id to continue the session from existing session, or create a new session based on the provided data.",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [
				newSessionRequest.vErr(),
				newSessionQuery.vErr(),
			],
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
