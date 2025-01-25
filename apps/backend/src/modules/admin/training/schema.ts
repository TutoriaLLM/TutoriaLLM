import { createValidationErrorResponseSchema } from "@/libs/errors/schemas";
import { stringToNumber } from "@/utils/zStringtoNumber";
import { z } from "@hono/zod-openapi";

// For Data table
export const dataIdSchema = z.object({
	id: stringToNumber.openapi({
		param: {
			name: "id",
			in: "path",
		},
	}),
});
export const dataMetadataSchema = z.object({
	author: z.string().optional(),
	date: z.string().optional(),
	sessionId: z.string().optional(),
});
export const dataSchema = z.object({
	id: stringToNumber,
	question: z.string(),
	answer: z.string(),
	metadata: dataMetadataSchema,
});

export type TrainingData = z.infer<typeof dataSchema>;

export const dataListSchema = z.array(dataSchema);

export const deleteDataParam = {
	schema: dataIdSchema.openapi("DeleteDataParam"),
	vErr: () =>
		createValidationErrorResponseSchema(deleteDataParam.schema).openapi(
			"DeleteDataParamValidationErrorResponse",
		),
};

// For Guide Table
export const guideIdSchema = z.object({
	id: stringToNumber.openapi({
		param: {
			name: "id",
			in: "path",
		},
	}),
});
export const guideSearchSchema = z.object({
	query: z.string(),
});
export const guideMetadataSchema = z.object({
	author: z.string().optional(),
	date: z.string().optional(),
	sessionId: z.string().optional(),
});

export const dataToGuideSchema = z.object({
	// Same schema as data
	id: stringToNumber,
	question: z.string(),
	answer: z.string(),
	metadata: guideMetadataSchema,
});
export const guideSchema = z.object({
	id: stringToNumber,
	metadata: guideMetadataSchema,
	question: z.string(),
	answer: z.string(),
	embedding: z.array(z.number()).nullable(),
});
export const guideListSchema = z.array(guideSchema);
export type Guide = z.infer<typeof guideSchema>;

export const getGuideSchema = guideSchema.pick({
	id: true,
	metadata: true,
	question: true,
	answer: true,
});
export const getGuideListSchema = z.array(getGuideSchema);
export const updateGuideSchema = guideSchema
	.pick({
		metadata: true,
		question: true,
		answer: true,
	})
	.partial();

export const newGuideRequest = {
	schema: dataToGuideSchema.openapi("NewGuideRequest"),
	vErr: () =>
		createValidationErrorResponseSchema(newGuideRequest.schema).openapi(
			"NewGuideRequestValidationErrorResponse",
		),
};
export const updateGuideRequest = {
	schema: updateGuideSchema.openapi("UpdateGuideRequest"),
	vErr: () =>
		createValidationErrorResponseSchema(updateGuideRequest.schema).openapi(
			"UpdateGuideRequestValidationErrorResponse",
		),
};
export const guideSearchQuery = {
	schema: guideSearchSchema.openapi("GuideSearchRequest"),
	vErr: () =>
		createValidationErrorResponseSchema(guideSearchQuery.schema).openapi(
			"GuideSearchRequestValidationErrorResponse",
		),
};
export const guideIdParam = {
	schema: guideIdSchema.openapi("GuideIdParam"),
	vErr: () =>
		createValidationErrorResponseSchema(guideIdParam.schema).openapi(
			"GuideIdParamValidationErrorResponse",
		),
};
