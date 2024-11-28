import { z } from "@hono/zod-openapi";
import { createValidationErrorResponseSchema } from "@/libs/errors/schemas";
import { stringToNumber } from "@/utils/zStringtoNumber";

//タグテーブルのスキーマ
export const tagSchema = z.object({
	id: z.number(),
	name: z.string(),
});

export const tagsSchema = z.array(tagSchema);

//メタデータのスキーマ
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
	schema: tutorialSchema.openapi("NewTutorialRequest"),
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

//AIを使用してコンテンツを生成するためのスキーマ
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
