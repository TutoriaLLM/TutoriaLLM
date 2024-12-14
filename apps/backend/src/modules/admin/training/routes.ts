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

// トレーニングデータの管理を行うAPI
export const getRandomData = createRoute({
	method: "get",
	path: "/admin/training/data/random",
	summary: "Get a random training data",
	responses: {
		200: {
			content: jsonBody(dataSchema),
			description: "Returns a random training data",
		},
		...errorResponses({}),
	},
});

export const listData = createRoute({
	method: "get",
	path: "/admin/training/data/list",
	summary: "List all training data",
	responses: {
		200: {
			content: jsonBody(dataListSchema),
			description: "Returns all training data",
		},
		...errorResponses({}),
	},
});

export const deleteData = createRoute({
	method: "delete",
	path: "/admin/training/data/{id}",
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

//Not in use
// export const getData = createRoute({
// 	method: "get",
// 	path: "/admin/training/data/:id",
// 	summary: "Get a training data from id",
// 	responses: {
// 		200: {
// 			content: jsonBody(dataSchema),
// 			description: "Returns a training data",
// 		},
// 		...errorResponses({}),
// 	},
// });

//データを元に作成するガイドのAPI

export const newGuide = createRoute({
	method: "post",
	path: "/admin/training/guide/new",
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

export const searchGuides = createRoute({
	method: "post",
	path: "/admin/training/guide/search",
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

export const listGuides = createRoute({
	method: "get",
	path: "/admin/training/guide/list",
	summary: "Return the list of guides",
	responses: {
		200: {
			content: jsonBody(getGuideListSchema),
			description: "Returns the list of guides",
		},
		...errorResponses({}),
	},
});

export const getGuide = createRoute({
	method: "get",
	path: "/admin/training/guide/{id}",
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

export const updateGuide = createRoute({
	method: "put",
	path: "/admin/training/guide/{id}",
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

export const deleteGuide = createRoute({
	method: "delete",
	path: "/admin/training/guide/{id}",
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
