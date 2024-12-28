import { createValidationErrorResponseSchema } from "@/libs/errors/schemas";
import { z } from "@hono/zod-openapi";

export const userStrSchema = z.object({
	string: z.union([z.string(), z.string().email()]),
});

export const sessionIdSchema = z.object({
	sessionId: z.string(),
});

export const userInfoSchema = z.object({
	id: z.string(),
	username: z.string().nullable(),
	email: z.string(),
	role: z.string().nullable(),
});

export const findUserIdFromStrParam = {
	schema: userStrSchema.openapi("userStrSchema"),
	vErr: () =>
		createValidationErrorResponseSchema(findUserIdFromStrParam.schema).openapi(
			"FindUserIdFromStrValidationErrorResponse",
		),
};

export const findUserIdFromSessionParam = {
	schema: sessionIdSchema.openapi("FindUserIdFromSessionSchema"),
	vErr: () =>
		createValidationErrorResponseSchema(
			findUserIdFromSessionParam.schema,
		).openapi("FindUserIdFromSessionValidationErrorResponse"),
};
