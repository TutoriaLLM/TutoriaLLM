import { createValidationErrorResponseSchema } from "@/libs/errors/schemas";
import { stringToNumber } from "@/utils/zStringtoNumber";
import { z } from "@hono/zod-openapi";

// Schema for tag table
export const tagSchema = z.object({
	id: z.number().nullable(), //serial - auto increment
	name: z.string(),
});

export const tagsSchema = z.array(tagSchema);

// Metadata Schema
export const metadataSchema = z.object({
	title: z.string(),
	description: z.string(),
	selectCount: z.number(),
	author: z.string().optional(),
});

export const tutorialSchema = z.object({
	id: z.number(),
	content: z.string(),
	tags: tagsSchema,
	language: z.string(),
	metadata: metadataSchema,
	serializednodes: z.string(),
});

export const newTutorialSchema = tutorialSchema.omit({ id: true });

export const getTutorialsSchema = z.array(
	tutorialSchema.pick({ id: true, tags: true, language: true, metadata: true }),
);

export const idSchema = z.object({
	id: stringToNumber.openapi({
		param: {
			name: "id",
			in: "path",
		},
	}),
});

export const specificTutorialParam = {
	schema: idSchema.openapi("GetSpecificTutorialParam"),
	vErr: () =>
		createValidationErrorResponseSchema(specificTutorialParam.schema).openapi(
			"GetSpecificTutorialParamValidationErrorResponse",
		),
};
export const newTutorialRequest = {
	schema: newTutorialSchema.openapi("NewTutorialRequest"),
	vErr: () =>
		createValidationErrorResponseSchema(newTutorialRequest.schema).openapi(
			"NewTutorialRequestValidationErrorResponse",
		),
};
export const updateTutorialRequest = {
	schema: tutorialSchema.openapi("UpdateTutorialRequest"),
	vErr: () =>
		createValidationErrorResponseSchema(updateTutorialRequest.schema).openapi(
			"UpdateTutorialRequestValidationErrorResponse",
		),
};

// Schema for generating content using AI
export const generateContentSchema = z.object({
	content: z.string(),
});
export const generateMetadataSchema = z.object({
	content: z.string(),
});
export const generatedContentSchema = z.object({
	content: z.string(),
});
export const generatedMetadataSchema = z.object({
	title: z.string(),
	description: z.string(),
	tags: z.array(z.string()),
	language: z.string(),
});

export const generateContentRequest = {
	schema: generateContentSchema.openapi("GenerateContentRequest"),
	vErr: () =>
		createValidationErrorResponseSchema(generateContentRequest.schema).openapi(
			"GenerateContentRequestValidationErrorResponse",
		),
};
export const generateMetadataRequest = {
	schema: generateMetadataSchema.openapi("GenerateMetadataRequest"),
	vErr: () =>
		createValidationErrorResponseSchema(generateMetadataRequest.schema).openapi(
			"GenerateMetadataRequestValidationErrorResponse",
		),
};
