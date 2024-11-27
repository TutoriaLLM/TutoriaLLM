// import express from "express";

import { OpenAPIHono } from "@hono/zod-openapi";
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
} from "./routes";
import { db } from "../../../db";
import { eq, sql } from "drizzle-orm";
import { errorResponse } from "../../../libs/errors";
import { guides, trainingData } from "../../../db/schema";
import { createGuideFromTrainingData } from "./utils/guide";
import { getKnowledge } from "./utils/knowledge";

import type { Context } from "../../../context";
import { defaultHook } from "../../../libs/default-hook";

const app = new OpenAPIHono<Context>({ defaultHook })
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
		if (data.length === 0) {
			return errorResponse(c, {
				message: "No data found",
				type: "NOT_FOUND",
			});
		}
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
		return c.text(`Data ${id} deleted`, 200);
	})
	.openapi(newGuide, async (c) => {
		const data = c.req.valid("json");
		try {
			const createdGuide = await createGuideFromTrainingData(data);
			await db.insert(guides).values(createdGuide);
			await db.delete(trainingData).where(eq(trainingData.id, data.id));
			return c.text("Guide created", 201);
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
		if (typeof result === "string") {
			return errorResponse(c, {
				message: result,
				type: "SERVER_ERROR",
			});
		}
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
		if (guidesList.length === 0) {
			return errorResponse(c, {
				message: "No guides found",
				type: "NOT_FOUND",
			});
		}
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
		return c.text("Guide updated", 200);
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
		return c.text(`Guide ${id} deleted`, 200);
	});

export default app;
