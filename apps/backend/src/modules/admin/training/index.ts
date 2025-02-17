import { errorResponse } from "@/libs/errors";
import {
	deleteData,
	deleteGuide,
	getGuide,
	getRandomData,
	listData,
	listGuides,
	newGuide,
	searchGuides,
	updateGuide,
} from "@/modules/admin/training/routes";
import { createGuideFromTrainingData } from "@/modules/admin/training/utils/guide";
import { getKnowledge } from "@/modules/admin/training/utils/knowledge";
import { eq, sql } from "drizzle-orm";
import { createHonoApp } from "@/create-app";
import { guides, trainingData } from "@/db/schema";

/**
 * This controller handles admin-based training data and guide operations.
 * It includes CRUD operations for training data and guides, as well as
 * utility functions to create guides from training data and query for knowledge.
 */
const app = createHonoApp()
	/**
	 * Get a random piece of training data
	 */
	.openapi(getRandomData, async (c) => {
		const data = await c.get("db").query.trainingData.findFirst({
			orderBy: sql`random()`,
		});
		if (!data) {
			return errorResponse(c, {
				message: "No data found",
				type: "NOT_FOUND",
			});
		}
		return c.json(data, 200);
	})
	/**
	 * List all training data
	 */
	.openapi(listData, async (c) => {
		const data = await c.get("db").query.trainingData.findMany();
		return c.json(data, 200);
	})
	/**
	 * Delete a piece of training data
	 */
	.openapi(deleteData, async (c) => {
		const id = c.req.valid("param").id;
		const data = await c.get("db").query.trainingData.findFirst({
			where: eq(trainingData.id, id),
		});
		if (!data) {
			return errorResponse(c, {
				message: "Data not found",
				type: "NOT_FOUND",
			});
		}
		const result = await c
			.get("db")
			.delete(trainingData)
			.where(eq(trainingData.id, id))
			.returning({ id: trainingData.id });
		if (!result || result.length === 0) {
			return errorResponse(c, {
				message: "Data to delete not found",
				type: "NOT_FOUND",
			});
		}
		return c.json(result, 200);
	})
	/**
	 * Create a new guide from training data
	 */
	.openapi(newGuide, async (c) => {
		const data = c.req.valid("json");
		try {
			const createdGuide = await createGuideFromTrainingData(data);
			// Insert the created guide into the guides table
			await c.get("db").insert(guides).values(createdGuide);
			// Remove the training data from which the guide was created
			await c
				.get("db")
				.delete(trainingData)
				.where(eq(trainingData.id, data.id));
			return c.json(createdGuide, 200);
		} catch (e) {
			console.error(e);
			return errorResponse(c, {
				message: "Failed to create guide",
				type: "SERVER_ERROR",
			});
		}
	})
	/**
	 * Search guides by a query string
	 */
	.openapi(searchGuides, async (c) => {
		const searchString = c.req.valid("query").query;
		const result = await getKnowledge(searchString);
		return c.json(result, 200);
	})
	/**
	 * List all existing guides
	 */
	.openapi(listGuides, async (c) => {
		const guidesList = await c.get("db").query.guides.findMany({
			columns: {
				id: true,
				metadata: true,
				question: true,
				answer: true,
			},
		});
		return c.json(guidesList, 200);
	})
	/**
	 * Get a guide by its ID
	 */
	.openapi(getGuide, async (c) => {
		const id = c.req.valid("param").id;
		const guide = await c.get("db").query.guides.findFirst({
			where: eq(guides.id, id),
		});
		if (!guide) {
			return errorResponse(c, {
				message: "Guide not found",
				type: "NOT_FOUND",
			});
		}
		return c.json(guide, 200);
	})
	/**
	 * Update a guide
	 */
	.openapi(updateGuide, async (c) => {
		const id = c.req.valid("param").id;
		const data = c.req.valid("json");

		const guide = await c.get("db").query.guides.findFirst({
			where: eq(guides.id, id),
		});
		if (!guide) {
			return errorResponse(c, {
				message: "Guide not found",
				type: "NOT_FOUND",
			});
		}

		const updatedGuide = {
			...guide,
			...data,
		};
		await c.get("db").update(guides).set(updatedGuide).where(eq(guides.id, id));

		return c.json(updatedGuide, 200);
	})
	/**
	 * Delete a guide by its ID
	 */
	.openapi(deleteGuide, async (c) => {
		const id = c.req.valid("param").id;
		const result = await c
			.get("db")
			.delete(guides)
			.where(eq(guides.id, id))
			.returning({ id: guides.id });

		if (!result || result.length === 0) {
			return errorResponse(c, {
				message: "Guide to delete not found",
				type: "NOT_FOUND",
			});
		}
		return c.json(result, 200);
	});

export default app;
