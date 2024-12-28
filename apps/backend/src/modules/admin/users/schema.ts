import { createValidationErrorResponseSchema } from "@/libs/errors/schemas";
import { z } from "@hono/zod-openapi";

export const userIdSchema = z.object({
	id: z.string(),
});

export const userDetailSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	image: z.string().nullable(),
	createdAt: z.string().date(),
	updatedAt: z.string().date(),
	role: z.string().nullable(),
	username: z.string().nullable(),
	isAnonymous: z.boolean().nullable(),
});

export const updateUserDetailSchema = z.object({
	name: z.string(),
	email: z.string(),
	image: z.string().nullable(),
	role: z.string().nullable(),
	username: z.string().nullable(),
});

export const userDetailParam = {
	schema: userIdSchema.openapi("userIdSchema"),
	vErr: () =>
		createValidationErrorResponseSchema(userDetailParam.schema).openapi(
			"FindUserIdFromStrValidationErrorResponse",
		),
};

export const updateUserDetailRequest = {
	schema: updateUserDetailSchema.openapi("userDetailSchema"),
	vErr: () =>
		createValidationErrorResponseSchema(updateUserDetailRequest.schema).openapi(
			"UpdateUserDetailValidationErrorResponse",
		),
};
