import {
	getSpecificTutorial,
	getTags,
	getTutorials,
} from "@/modules/tutorials/routes";
import { eq } from "drizzle-orm";
import { createHonoApp } from "@/create-app";
import { tags, tutorials } from "@/db/schema/tutorial";

const app = createHonoApp()
	/**
	 * Get all tutorials
	 */
	.openapi(getTutorials, async (c) => {
		const getTutorials = await c
			.get("db")
			.select({
				id: tutorials.id,
				tags: tutorials.tags,
				language: tutorials.language,
				metadata: tutorials.metadata,
			})
			.from(tutorials);
		return c.json(getTutorials, 200);
	})
	/**
	 * Get all tags
	 */
	.openapi(getTags, async (c) => {
		const allTags = await c.get("db").select().from(tags);
		return c.json(allTags, 200);
	})
	/**
	 * Get a specific tutorial
	 */
	.openapi(getSpecificTutorial, async (c) => {
		const id = c.req.valid("param").id;
		const tutorial = await c.get("db").query.tutorials.findFirst({
			where: eq(tutorials.id, id),
		});
		return c.json(tutorial, 200);
	});

export default app;
