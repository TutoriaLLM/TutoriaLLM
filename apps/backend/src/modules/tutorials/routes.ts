import { errorResponses, jsonBody } from "@/libs/openapi";
import {
	getSpecificTutorialParam,
	getTutorialsSchema,
	tagsSchema,
	tutorialSchema,
} from "@/modules/tutorials/schema";
import { createRoute } from "@hono/zod-openapi";

/**
 * Base config for tutorials
 */
const baseTutorialsConfig = {
	path: "/tutorials" as const,
	tags: ["tutorials"],
};

/**
 * Get list of tutorials
 */
const getTutorials = createRoute({
	...baseTutorialsConfig,
	method: "get",
	path: baseTutorialsConfig.path,
	summary: "Get list of tutorials (without content)",
	responses: {
		200: {
			content: jsonBody(getTutorialsSchema),
			description: "Returns the app configuration, without content",
		},
		...errorResponses({}),
	},
});

/**
 * Get specific tutorial by id
 */
const getSpecificTutorial = createRoute({
	...baseTutorialsConfig,
	method: "get",
	path: `${baseTutorialsConfig.path}/{id}`,
	summary: "Get specific tutorial by id",
	request: {
		params: getSpecificTutorialParam.schema,
	},
	responses: {
		200: {
			content: jsonBody(tutorialSchema),
			description: "Returns the tutorial content",
		},
		...errorResponses({
			validationErrorResnponseSchemas: [getSpecificTutorialParam.vErr()],
		}),
	},
});

/**
 * Get list of tags
 */
const getTags = createRoute({
	...baseTutorialsConfig,
	method: "get",
	path: `${baseTutorialsConfig.path}/tags`,
	summary: "Get list of tags from all tutorials",
	responses: {
		200: {
			content: jsonBody(tagsSchema),
			description: "Returns the list of tags from all tutorials",
		},
		...errorResponses({}),
	},
});

export { getSpecificTutorial, getTutorials, getTags };
