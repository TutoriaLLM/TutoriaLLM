import { createValidationErrorResponseSchema } from "@/libs/errors/schemas";
import { z } from "@hono/zod-openapi";

//image will be sent as raw data
export const imageUploadedSchema = z.object({
	fileName: z.string(),
});

export const imageQuerySchema = z.object({
	fileName: z.string(),
});

export const imageDeleteSchema = z.object({
	fileName: z.string(),
});

export const imageListSchema = z.object({
	maxKeys: z.number().optional(),
});

export const deleteImageQuery = {
	schema: imageDeleteSchema.openapi("DeleteImageQuery"),
	vErr: () =>
		createValidationErrorResponseSchema(deleteImageQuery.schema).openapi(
			"DeleteImageQueryValidationErrorResponse",
		),
};

export const listImageQuery = {
	schema: imageListSchema.openapi("ListImageQuery"),
	vErr: () =>
		createValidationErrorResponseSchema(listImageQuery.schema).openapi(
			"ListImageQueryValidationErrorResponse",
		),
};

export const getImageQuery = {
	schema: imageQuerySchema.openapi("GetImageQuery"),
	vErr: () =>
		createValidationErrorResponseSchema(getImageQuery.schema).openapi(
			"GetImageQueryValidationErrorResponse",
		),
};
