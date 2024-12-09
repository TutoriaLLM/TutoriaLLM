import { createRoute } from "@hono/zod-openapi";
import { errorResponses, jsonBody } from "@/libs/openapi";
import {
	newUserRequest,
	putUserRequest,
	userIdParam,
	getUserListSchema,
	getUserSchema,
} from "@/modules/admin/users/schema";
import { idSchema } from "@/modules/tutorials/schema";

export const getUserList = createRoute({
	method: "get",
	path: "/admin/users",
	summary: "Get list of users",
	responses: {
		200: {
			content: jsonBody(getUserListSchema),
			description: "Returns the list of users",
		},
	},
});

export const createUser = createRoute({
	method: "post",
	path: "/admin/users",
	summary: "Create a new user, from username and password",
	request: {
		body: {
			content: jsonBody(newUserRequest.schema),
		},
	},
	responses: {
		200: {
			content: jsonBody(getUserSchema),
			description: "Returns the user data",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [newUserRequest.vErr()],
		}),
	},
});

export const getUser = createRoute({
	method: "get",
	path: "/admin/users/{id}",
	summary: "Get username and id by id",
	request: {
		params: userIdParam.schema,
	},
	responses: {
		200: {
			content: jsonBody(getUserSchema),
			description: "Returns the user data",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [userIdParam.vErr()],
		}),
	},
});

export const updateUser = createRoute({
	method: "put",
	path: "/admin/users/{id}",
	summary: "Update user data",
	request: {
		params: userIdParam.schema,
		body: {
			content: jsonBody(putUserRequest.schema),
		},
	},
	responses: {
		200: {
			content: jsonBody(idSchema),
			description: "Returns the user data",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [
				userIdParam.vErr(),
				newUserRequest.vErr(),
			],
		}),
	},
});

export const deleteUser = createRoute({
	method: "delete",
	path: "/admin/users/{id}",
	summary: "Delete user",
	request: {
		params: userIdParam.schema,
	},
	responses: {
		200: {
			content: jsonBody(idSchema),
			description: "Returns the user data",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [userIdParam.vErr()],
		}),
	},
});
