import { errorResponses, jsonBody } from "@/libs/openapi";
import { verifyAuth } from "@/middleware/auth";
import {
	deleteAudioQuery,
	getAudioQuery,
	audioUploadedSchema,
	listAudioQuery,
} from "@/modules/audio/schema";
import { createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
const baseAudioConfig = {
	path: "/audio" as const,
	tags: ["audio"],
};

export const uploadAudio = createRoute({
	...baseAudioConfig,
	method: "post",
	path: `${baseAudioConfig.path}/upload`,
	middleware: [verifyAuth] as const,
	summary: "Upload an audio",
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
			content: jsonBody(audioUploadedSchema),
			description: "Returns the audio name",
		},
		...errorResponses({}),
	},
});

export const deleteAudio = createRoute({
	...baseAudioConfig,
	method: "delete",
	path: `${baseAudioConfig.path}/delete`,
	middleware: [verifyAuth] as const,
	summary: "Delete an audio",
	request: {
		query: deleteAudioQuery.schema,
	},
	responses: {
		200: {
			description: "Returns the audio name",
		},
		...errorResponses({
			validationErrorResponseSchemas: [deleteAudioQuery.vErr()],
		}),
	},
});

export const listAudio = createRoute({
	...baseAudioConfig,
	method: "get",
	path: `${baseAudioConfig.path}/list`,
	middleware: [verifyAuth] as const,
	summary: "List audios",
	request: {
		query: listAudioQuery.schema,
	},
	responses: {
		200: {
			description: "Returns the audio name",
		},
		...errorResponses({
			validationErrorResponseSchemas: [listAudioQuery.vErr()],
		}),
	},
});

export const getAudio = createRoute({
	...baseAudioConfig,
	method: "get",
	path: `${baseAudioConfig.path}/{fileName}`,
	summary: "Get an audio by fileName",
	request: {
		params: getAudioQuery.schema,
	},
	responses: {
		200: {
			description: "Returns the audio file by File object",
			content: {
				"application/octet-stream": {
					schema: z.instanceof(ArrayBuffer),
				},
			},
		},
		...errorResponses({
			validationErrorResponseSchemas: [getAudioQuery.vErr()],
		}),
	},
});
