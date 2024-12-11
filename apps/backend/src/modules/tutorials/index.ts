import { OpenAPIHono } from "@hono/zod-openapi";
import {
	getSpecificTutorial,
	getTags,
	getTutorials,
} from "@/modules/tutorials/routes";
import { db } from "@/db";
import { tags, tutorials } from "@/db/schema";
import { errorResponse } from "@/libs/errors";
import { eq } from "drizzle-orm";

import type { Context } from "@/context";
import { defaultHook } from "@/libs/default-hook";

const app = new OpenAPIHono<Context>({ defaultHook })
	.openapi(getTutorials, async (c) => {
		const getTutorials = await db
			.select({
				id: tutorials.id,
				tags: tutorials.tags,
				language: tutorials.language,
				metadata: tutorials.metadata,
			})
			.from(tutorials);
		if (getTutorials.length === 0) {
			return errorResponse(c, {
				message: "No tutorials found",
				type: "NOT_FOUND",
			});
		}
		return c.json(getTutorials, 200);
	})
	.openapi(getTags, async (c) => {
		const allTags = await db.select().from(tags);
		if (allTags.length === 0) {
			return errorResponse(c, {
				message: "No tags found",
				type: "NOT_FOUND",
			});
		}
		return c.json(allTags, 200);
	})
	.openapi(getSpecificTutorial, async (c) => {
		const id = c.req.valid("param").id;
		const tutorial = await db.query.tutorials.findFirst({
			where: eq(tutorials.id, id),
		});
		return c.json(tutorial, 200);
	});

export default app;
