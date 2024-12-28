import { createRoute } from "@hono/zod-openapi";
import {
	updateUserDetailRequest,
	userDetailParam,
	userDetailSchema,
	userIdSchema,
} from "./schema";
import { errorResponses, jsonBody } from "@/libs/openapi";

//get user's detailed information from id
export const userDetailFromId = createRoute({
	method: "get",
	summary: "Get user's detailed information from id",
	path: "/admin/users/{id}",
	request: {
		params: userDetailParam.schema,
	},
	responses: {
		200: {
			content: jsonBody(userDetailSchema),
			description: "Returns the user's detailed information",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [userDetailParam.vErr()],
		}),
	},
});

//update user's detailed information manually instead of Better-auth
export const updateUserDetail = createRoute({
	method: "put",
	summary: "Update user's detailed information",
	path: "/admin/users/{id}",
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
			validationErrorResnponseSchemas: [userDetailParam.vErr()],
		}),
	},
});
