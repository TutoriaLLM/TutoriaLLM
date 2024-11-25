import { OpenAPIHono } from "@hono/zod-openapi";
import { getSpecificTutorial, getTags, getTutorials } from "./routes";
import { db } from "../../db";
import { tags, tutorials } from "../../db/schema";
import { errorResponse } from "../../libs/errors";
import { eq } from "drizzle-orm";

const app = new OpenAPIHono()
	.openapi(getTutorials, async (c) => {
		const getTutorials = await db
			.select({
				id: tutorials.id,
				tags: tutorials.tags,
				language: tutorials.language,
				metadata: tutorials.metadata,
			})
			.from(tutorials);
		return c.json(getTutorials);
	})
	.openapi(getSpecificTutorial, async (c) => {
		const id = c.req.valid("param").id;
		const tutorial = await db.query.tutorials.findFirst({
			where: eq(tutorials.id, id),
		});
		return c.json(tutorial);
	})
	.openapi(getTags, async (c) => {
		const allTags = await db.select().from(tags);
		return c.json(allTags);
	});

export default app;
