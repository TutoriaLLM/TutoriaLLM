import { createRoute } from "@hono/zod-openapi";
import {
	findUserIdFromSessionParam,
	findUserIdFromStrParam,
	userInfoSchema,
} from "./schema";
import { errorResponses, jsonBody } from "@/libs/openapi";

//get user information from username or email
export const findUserIdFromStr = createRoute({
	method: "get",
	path: "/admin/users/find/{string}",
	summary: "Find user by username or email",
	request: {
		params: findUserIdFromStrParam.schema,
	},
	responses: {
		200: {
			content: jsonBody(userInfoSchema),
			description: "Returns the user information",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [findUserIdFromStrParam.vErr()],
		}),
	},
});

//get user information from session
export const findUserIdFromSession = createRoute({
	method: "get",
	path: "/admin/users/find/session/{sessionId}",
	summary: "Find user by session id",
	request: {
		params: findUserIdFromSessionParam.schema,
	},
	responses: {
		200: {
			content: jsonBody(userInfoSchema),
			description: "Returns the user information",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [findUserIdFromSessionParam.vErr()],
		}),
	},
});
