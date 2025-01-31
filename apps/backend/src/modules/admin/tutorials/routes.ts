import { errorResponses, jsonBody } from "@/libs/openapi";
import {
	generateContentRequest,
	generateMetadataRequest,
	generatedContentSchema,
	generatedMetadataSchema,
	getTutorialsSchema,
	newTutorialRequest,
	specificTutorialParam,
	tutorialSchema,
	updateTutorialRequest,
} from "@/modules/admin/tutorials/schema";
import { createRoute } from "@hono/zod-openapi";

/**
 * Base config for admin tutorials
 */
const baseAdminTutorialsConfig = {
	path: "/admin/tutorials" as const,
	tags: ["admin-tutorials"],
};

/**
 * Get all tutorials
 */
export const getTutorialList = createRoute({
	...baseAdminTutorialsConfig,
	method: "get",
	path: baseAdminTutorialsConfig.path,
	summary: "Get all tutorials",
	responses: {
		200: {
			content: jsonBody(getTutorialsSchema),
			description: "Returns the list of tutorials",
		},
		...errorResponses({}),
	},
});

/**
 * Get a specific tutorial by ID
 */
export const getSpecificTutorial = createRoute({
	...baseAdminTutorialsConfig,
	method: "get",
	path: `${baseAdminTutorialsConfig.path}/{id}`,
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

/**
 * Delete a tutorial by ID
 */
export const deleteTutorial = createRoute({
	...baseAdminTutorialsConfig,
	method: "delete",
	path: `${baseAdminTutorialsConfig.path}/{id}`,
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

/**
 * Create a new tutorial
 */
export const createTutorial = createRoute({
	...baseAdminTutorialsConfig,
	method: "post",
	path: baseAdminTutorialsConfig.path,
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

/**
 * Update a tutorial by ID
 */
export const updateTutorial = createRoute({
	...baseAdminTutorialsConfig,
	method: "put",
	path: `${baseAdminTutorialsConfig.path}/{id}`,
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

/**
 * Generate content using AI
 */
export const generateContent = createRoute({
	...baseAdminTutorialsConfig,
	method: "post",
	path: `${baseAdminTutorialsConfig.path}/generate-content`,
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

/**
 * Generate metadata using AI
 */
export const generateMetadata = createRoute({
	...baseAdminTutorialsConfig,
	method: "post",
	path: `${baseAdminTutorialsConfig.path}/generate-metadata`,
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
