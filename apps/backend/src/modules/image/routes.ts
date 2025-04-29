import { errorResponses, jsonBody } from "@/libs/openapi";
import { verifyAuth } from "@/middleware/auth";
import {
	deleteImageQuery,
	getImageQuery,
	imageUploadedSchema,
	listImageQuery,
} from "@/modules/image/schema";
import { createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
const baseImageConfig = {
	path: "/image" as const,
	tags: ["image"],
};

export const uploadImage = createRoute({
	...baseImageConfig,
	method: "post",
	path: `${baseImageConfig.path}/upload`,
	middleware: [verifyAuth] as const,
	summary: "Upload an image",
	request: {
		body: {
			content: {
				"multipart/form-data": {
					schema: z.object({
						file: z.instanceof(File),
					}),
				},
			},
		},
	},
	responses: {
		200: {
			content: jsonBody(imageUploadedSchema),
			description: "Returns the image name",
		},
		...errorResponses({}),
	},
});

export const deleteImage = createRoute({
	...baseImageConfig,
	method: "delete",
	path: `${baseImageConfig.path}/delete`,
	middleware: [verifyAuth] as const,
	summary: "Delete an image",
	request: {
		query: deleteImageQuery.schema,
	},
	responses: {
		200: {
			description: "Returns the image name",
		},
		...errorResponses({
			validationErrorResponseSchemas: [deleteImageQuery.vErr()],
		}),
	},
});

export const listImage = createRoute({
	...baseImageConfig,
	method: "get",
	path: `${baseImageConfig.path}/list`,
	middleware: [verifyAuth] as const,
	summary: "List images",
	request: {
		query: listImageQuery.schema,
	},
	responses: {
		200: {
			description: "Returns the image name",
		},
		...errorResponses({
			validationErrorResponseSchemas: [listImageQuery.vErr()],
		}),
	},
});

export const getImage = createRoute({
	...baseImageConfig,
	method: "get",
	path: `${baseImageConfig.path}/{fileName}`,
	summary: "Get an image by fileName",
	request: {
		params: getImageQuery.schema,
	},
	responses: {
		200: {
			description: "Returns the image file by File object",
			content: {
				"application/octet-stream": {
					schema: z.instanceof(ArrayBuffer),
				},
			},
		},
		...errorResponses({
			validationErrorResponseSchemas: [getImageQuery.vErr()],
		}),
	},
});
