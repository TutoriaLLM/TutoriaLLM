import { z } from "zod";
import password from "../../../utils/password";
import { createValidationErrorResponseSchema } from "../../../libs/errors/schemas";
import { stringToNumber } from "../../../utils/zStringtoNumber";

const userSchema = z.object({
	id: z.number(),
	username: z.string(),
	password: z.string(),
});

export const userSchemaWithoutName = userSchema.pick({ id: true });

export const getUserSchema = userSchema.pick({ id: true, username: true });

export const getUserListSchema = z.array(getUserSchema);

const newUserSchema = userSchema.pick({ username: true, password: true });

const putUserSchema = userSchema.partial();

const idSchema = z.object({
	id: stringToNumber.openapi({
		param: {
			name: "id",
			in: "path",
		},
	}),
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
