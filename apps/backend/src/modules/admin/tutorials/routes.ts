import { errorResponses, jsonBody } from "../../../libs/openapi";
import {
	generateContentRequest,
	generatedContentSchema,
	generatedMetadataSchema,
	generateMetadataRequest,
	getTutorialsSchema,
	newTutorialRequest,
	specificTutorialParam,
	tutorialSchema,
	updateTutorialRequest,
} from "./schema";
import { createRoute } from "@hono/zod-openapi";

export const getTutorialList = createRoute({
	method: "get",
	path: "/admin/tutorials",
	summary: "Get all tutorials",
	responses: {
		200: {
			content: jsonBody(getTutorialsSchema),
			description: "Returns the list of tutorials",
		},
		...errorResponses({}),
	},
});
export const getSpecificTutorial = createRoute({
	method: "get",
	path: "/admin/tutorials/{id}",
	summary: "Get a specific tutorial by ID",
	request: {
		params: specificTutorialParam.schema,
	},
	responses: {
		200: {
			content: jsonBody(tutorialSchema),
			description: "Returns the tutorial",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [specificTutorialParam.vErr()],
		}),
	},
});
export const deleteTutorial = createRoute({
	method: "delete",
	path: "/admin/tutorials/{id}",
	summary: "Delete a tutorial by ID",
	request: {
		params: specificTutorialParam.schema,
	},
	responses: {
		200: {
			description: "Returns 200(OK)",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [specificTutorialParam.vErr()],
		}),
	},
});
export const createTutorial = createRoute({
	method: "post",
	path: "/admin/tutorials",
	summary: "Create a new tutorial",
	request: {
		body: {
			content: jsonBody(newTutorialRequest.schema),
		},
	},
	responses: {
		200: {
			description: "Returns the 200(OK)",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [newTutorialRequest.vErr()],
		}),
	},
});
export const updateTutorial = createRoute({
	method: "put",
	path: "/admin/tutorials/{id}",
	summary: "Update a tutorial by ID",
	request: {
		params: specificTutorialParam.schema,
		body: {
			content: jsonBody(updateTutorialRequest.schema),
		},
	},
	responses: {
		200: {
			description: "Returns 200(OK)",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [
				specificTutorialParam.vErr(),
				updateTutorialRequest.vErr(),
			],
		}),
	},
});

//AIを使用してコンテンツを生成するためのエンドポイント
export const generateContent = createRoute({
	method: "post",
	path: "/admin/tutorials/generate-content",
	summary: "Generate content using AI",
	request: {
		body: {
			content: jsonBody(generateContentRequest.schema),
		},
	},
	responses: {
		200: {
			content: jsonBody(generatedContentSchema),
			description: "Returns the generated content",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [generateContentRequest.vErr()],
		}),
	},
});
export const generateMetadata = createRoute({
	method: "post",
	path: "/admin/tutorials/generate-metadata",
	summary: "Generate metadata using AI",
	request: {
		body: {
			content: jsonBody(generateMetadataRequest.schema),
		},
	},
	responses: {
		200: {
			content: jsonBody(generatedMetadataSchema),
			description: "Returns the generated metadata",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [generateMetadataRequest.vErr()],
		}),
	},
});
