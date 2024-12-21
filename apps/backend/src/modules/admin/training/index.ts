import { db } from "@/db";
import { guides, trainingData } from "@/db/schema";
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

const app = createHonoApp()
	.openapi(getRandomData, async (c) => {
		const data = await db.query.trainingData.findFirst({
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
	.openapi(listData, async (c) => {
		const data = await db.query.trainingData.findMany();
		return c.json(data, 200);
	})
	.openapi(deleteData, async (c) => {
		const id = c.req.valid("param").id;
		const data = await db.query.trainingData.findFirst({
			where: eq(trainingData.id, id),
		});
		if (!data) {
			return errorResponse(c, {
				message: "Data not found",
				type: "NOT_FOUND",
			});
		}
		const result = await db
			.delete(trainingData)
			.where(eq(trainingData.id, id))
			.returning({ id: trainingData.id });
		if (result === undefined) {
			return errorResponse(c, {
				message: "Data to delete not found",
				type: "NOT_FOUND",
			});
		}
		return c.json(result, 200);
	})
	.openapi(newGuide, async (c) => {
		const data = c.req.valid("json");
		try {
			const createdGuide = await createGuideFromTrainingData(data);
			await db.insert(guides).values(createdGuide);
			await db.delete(trainingData).where(eq(trainingData.id, data.id));
			return c.json(createdGuide, 200);
		} catch (e) {
			console.error(e);
			return errorResponse(c, {
				message: "Failed to create guide",
				type: "SERVER_ERROR",
			});
		}
	})
	.openapi(searchGuides, async (c) => {
		const searchString = c.req.valid("query").query;
		const result = await getKnowledge(searchString);
		return c.json(result, 200);
	})
	.openapi(listGuides, async (c) => {
		const guidesList = await db.query.guides.findMany({
			columns: {
				id: true,
				metadata: true,
				question: true,
				answer: true,
			},
		});
		return c.json(guidesList, 200);
	})
	.openapi(getGuide, async (c) => {
		const id = c.req.valid("param").id;
		const guide = await db.query.guides.findFirst({
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
	.openapi(updateGuide, async (c) => {
		const id = c.req.valid("param").id;
		const data = c.req.valid("json");
		const guide = await db.query.guides.findFirst({
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
		await db.update(guides).set(updatedGuide).where(eq(guides.id, id));
		return c.json(updatedGuide, 200);
	})
	.openapi(deleteGuide, async (c) => {
		const id = c.req.valid("param").id;
		const result = await db
			.delete(guides)
			.where(eq(guides.id, id))
			.returning({ id: guides.id });
		if (result === undefined) {
			return errorResponse(c, {
				message: "Guide to delete not found",
				type: "NOT_FOUND",
			});
		}
		return c.json(result, 200);
	});

export default app;
