import { errorResponses, jsonBody } from "@/libs/openapi";
import {
	dataListSchema,
	dataSchema,
	deleteDataParam,
	getGuideListSchema,
	guideIdParam,
	guideListSchema,
	guideSchema,
	guideSearchQuery,
	newGuideRequest,
	updateGuideRequest,
} from "@/modules/admin/training/schema";
import { createRoute } from "@hono/zod-openapi";

/**
 * Base config for training data
 */
const baseTrainingDataConfig = {
	path: "/admin/training/data" as const,
	tags: ["admin-training-data"],
};

/**
 * Get a random training data
 */
export const getRandomData = createRoute({
	...baseTrainingDataConfig,
	method: "get",
	path: `${baseTrainingDataConfig.path}/random`,
	summary: "Get a random training data",
	responses: {
		200: {
			content: jsonBody(dataSchema),
			description: "Returns a random training data",
		},
		...errorResponses({}),
	},
});

/**
 * List all training data
 */
export const listData = createRoute({
	...baseTrainingDataConfig,
	method: "get",
	path: `${baseTrainingDataConfig.path}/list`,
	summary: "List all training data",
	responses: {
		200: {
			content: jsonBody(dataListSchema),
			description: "Returns all training data",
		},
		...errorResponses({}),
	},
});

/**
 * Delete a training data from id
 */
export const deleteData = createRoute({
	...baseTrainingDataConfig,
	method: "delete",
	path: `${baseTrainingDataConfig.path}/{id}`,
	summary: "Delete a training data from id",
	request: {
		params: deleteDataParam.schema,
	},
	responses: {
		200: {
			description: "Returns 200(OK)",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [deleteDataParam.vErr()],
		}),
	},
});

/**
 * Base config for training guides
 */
const baseTrainingGuideConfig = {
	path: "/admin/training/guide" as const,
	tags: ["admin-training-guide"],
};

/**
 * Create a new guide from data
 */
export const newGuide = createRoute({
	...baseTrainingGuideConfig,
	method: "post",
	path: `${baseTrainingGuideConfig.path}/new`,
	summary: "Create a new guide from data",
	request: {
		body: {
			content: jsonBody(newGuideRequest.schema),
		},
	},
	responses: {
		200: {
			description: "Returns 200(OK)",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [newGuideRequest.vErr()],
		}),
	},
});

/**
 * Search guides by query
 */
export const searchGuides = createRoute({
	...baseTrainingGuideConfig,
	method: "post",
	path: `${baseTrainingGuideConfig.path}/search`,
	summary: "Search guides by query",
	request: {
		query: guideSearchQuery.schema,
	},
	responses: {
		200: {
			content: jsonBody(guideListSchema),
			description: "Returns the list of guides",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [guideSearchQuery.vErr()],
		}),
	},
});

/**
 * Return the list of guides
 */
export const listGuides = createRoute({
	...baseTrainingGuideConfig,
	method: "get",
	path: `${baseTrainingGuideConfig.path}/list`,
	summary: "Return the list of guides",
	responses: {
		200: {
			content: jsonBody(getGuideListSchema),
			description: "Returns the list of guides",
		},
		...errorResponses({}),
	},
});

/**
 * Get a guide from id
 */
export const getGuide = createRoute({
	...baseTrainingGuideConfig,
	method: "get",
	path: `${baseTrainingGuideConfig.path}/{id}`,
	summary: "Get a guide from id",
	request: {
		params: guideIdParam.schema,
	},
	responses: {
		200: {
			content: jsonBody(guideSchema),
			description: "Returns the guide",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [guideIdParam.vErr()],
		}),
	},
});

/**
 * Update a guide
 */
export const updateGuide = createRoute({
	...baseTrainingGuideConfig,
	method: "put",
	path: `${baseTrainingGuideConfig.path}/{id}`,
	summary: "Update a guide",
	request: {
		params: guideIdParam.schema,
		body: {
			content: jsonBody(updateGuideRequest.schema),
		},
	},
	responses: {
		200: {
			description: "Returns 200(OK)",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [guideIdParam.vErr()],
		}),
	},
});

/**
 * Delete a guide
 */
export const deleteGuide = createRoute({
	...baseTrainingGuideConfig,
	method: "delete",
	path: `${baseTrainingGuideConfig.path}/{id}`,
	summary: "Delete a guide",
	request: {
		params: guideIdParam.schema,
	},
	responses: {
		200: {
			description: "Returns 200(OK)",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [guideIdParam.vErr()],
		}),
	},
});
