import { createValidationErrorResponseSchema } from "@/libs/errors/schemas";
import { z } from "@hono/zod-openapi";

//image will be sent as raw data
export const audioUploadedSchema = z.object({
	fileName: z.string(),
});

export const audioQuerySchema = z.object({
	fileName: z.string(),
});

export const audioDeleteSchema = z.object({
	fileName: z.string(),
});

export const audioListSchema = z.object({
	maxKeys: z.number().optional(),
});

export const deleteAudioQuery = {
	schema: audioDeleteSchema.openapi("DeleteAudioQuery"),
	vErr: () =>
		createValidationErrorResponseSchema(deleteAudioQuery.schema).openapi(
			"DeleteAudioQueryValidationErrorResponse",
		),
};

export const listAudioQuery = {
	schema: audioListSchema.openapi("ListAudioQuery"),
	vErr: () =>
		createValidationErrorResponseSchema(listAudioQuery.schema).openapi(
			"ListAudioQueryValidationErrorResponse",
		),
};

export const getAudioQuery = {
	schema: audioQuerySchema.openapi("GetAudioQuery"),
	vErr: () =>
		createValidationErrorResponseSchema(getAudioQuery.schema).openapi(
			"GetAudioQueryValidationErrorResponse",
		),
};
