import { z } from "zod";
import password from "../../../utils/password";
import { createValidationErrorResponseSchema } from "../../../libs/errors/schemas";

export const userSchema = z.object({
	id: z.number(),
	username: z.string(),
});

export const userListSchema = z.array(userSchema);

export const userSchemaWithoutName = userSchema.pick({ id: true });

const newUserSchema = z.object({
	username: z.string(),
	password: z.string(),
});

const putUserSchema = z.object({
	username: z.string().optional(),
	password: z.string().optional(),
});

const idSchema = z.object({
	id: z.number(),
});

export const newUserRequest = {
	schema: newUserSchema.openapi("NewUserRequest"),
	vErr: () =>
		createValidationErrorResponseSchema(newUserRequest.schema).openapi(
			"NewUserRequestValidationErrorResponse",
		),
};

export const putUserRequest = {
	schema: putUserSchema.openapi("PutUserRequest"),
	vErr: () =>
		createValidationErrorResponseSchema(putUserRequest.schema).openapi(
			"PutUserRequestValidationErrorResponse",
		),
};

export const userIdParam = {
	schema: idSchema.openapi("PutUserParam"),
	vErr: () =>
		createValidationErrorResponseSchema(userIdParam.schema).openapi(
			"PutUserParamValidationErrorResponse",
		),
};
