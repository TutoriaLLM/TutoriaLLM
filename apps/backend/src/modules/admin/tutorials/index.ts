import { db } from "@/db";
import { tags, tutorials, tutorialsTags } from "@/db/schema";
import { errorResponse } from "@/libs/errors";
import { generateMetadataFromContent } from "@/modules/admin/tutorials/llm/metadata";
import { generateContentFromContent } from "@/modules/admin/tutorials/llm/tutorial";
import {
	createTutorial,
	deleteTutorial,
	generateContent,
	generateMetadata,
	getSpecificTutorial,
	getTutorialList,
	updateTutorial,
} from "@/modules/admin/tutorials/routes";
import { eq, isNull } from "drizzle-orm";
import { createHonoApp } from "@/create-app";

const app = createHonoApp()
	.openapi(getTutorialList, async (c) => {
		const allTutorials = await db
			.select() // Might be better to eliminate unnecessary fields.
			.from(tutorials);

		return c.json(allTutorials, 200);
	})
	.openapi(getSpecificTutorial, async (c) => {
		const id = c.req.valid("param").id;
		const tutorial = await db.query.tutorials.findFirst({
			where: eq(tutorials.id, id),
		});
		if (!tutorial) {
			return errorResponse(c, {
				message: "Tutorial not found",
				type: "NOT_FOUND",
			});
		}
		return c.json(tutorial, 200);
	})
	.openapi(deleteTutorial, async (c) => {
		const id = c.req.valid("param").id;
		// Delete tutorialsTags related to the preceding
		await db.delete(tutorialsTags).where(eq(tutorialsTags.tutorialId, id));
		// Delete tutorials records
		const result = await db
			.delete(tutorials)
			.where(eq(tutorials.id, id))
			.returning({ id: tutorials.id });
		if (result.length === 0) {
			return errorResponse(c, {
				message: "Tutorial to delete not found",
				type: "NOT_FOUND",
			});
		}
		return c.json(result, 200);
	})
	.openapi(createTutorial, async (c) => {
		const data = c.req.valid("json");
		try {
			const tutorial = await db
				.insert(tutorials)
				.values(data)
				.returning({ id: tutorials.id, tags: tutorials.tags });
			if (data.tags && data.tags.length > 0) {
				for (const tag of data.tags) {
					let existingTag = await db
						.select()
						.from(tags)
						.where(eq(tags.name, tag.name));

					if (existingTag.length === 0) {
						// If the tag does not exist, create it
						const [newTag] = await db
							.insert(tags)
							.values({ name: tag.name })
							.returning({ id: tags.id });
						existingTag = [
							{
								id: newTag.id,
								name: tag.name,
							},
						];
					}

					// Add association to tutorialsTags table
					await db.insert(tutorialsTags).values({
						tutorialId: tutorial[0].id,
						tagId: existingTag[0].id,
					});
				}
			}
			return c.json(tutorial, 200);
		} catch (e) {
			return errorResponse(c, {
				message: "Failed to create tutorial",
				type: "SERVER_ERROR",
			});
		}
	})
	.openapi(updateTutorial, async (c) => {
		const id = c.req.valid("param").id;
		try {
			const tutorial = await db
				.select()
				.from(tutorials)
				.where(eq(tutorials.id, id));
			if (!tutorial) {
				return errorResponse(c, {
					message: "Tutorial not found",
					type: "NOT_FOUND",
				});
			}
			const tutorialToUpdate = c.req.valid("json");
			// Updated tutorial content
			await db
				.update(tutorials)
				.set({
					content: tutorialToUpdate.content,
					metadata: tutorialToUpdate.metadata,
					language: tutorialToUpdate.language,
					serializednodes: tutorialToUpdate.serializednodes,
				})
				.where(eq(tutorials.id, id));

			// Update Tags
			if (tutorialToUpdate.tags && tutorialToUpdate.tags.length > 0) {
				// Delete existing tag associations
				await db.delete(tutorialsTags).where(eq(tutorialsTags.tutorialId, id));

				// Add new tag to tutorialsTags table
				for (const tag of tutorialToUpdate.tags) {
					let existingTag = await db
						.select()
						.from(tags)
						.where(eq(tags.name, tag.name));

					if (existingTag.length === 0) {
						// If the tag does not exist, create it
						const [newTag] = await db
							.insert(tags)
							.values({ name: tag.name })
							.returning({ id: tags.id });
						existingTag = [
							{
								id: newTag.id,
								name: tag.name,
							},
						];
					}

					// Add association to tutorialsTags table
					await db.insert(tutorialsTags).values({
						tutorialId: id,
						tagId: existingTag[0].id,
					});
				}
			}

			// Remove unused tags
			const unusedTags = await db
				.select({ id: tags.id })
				.from(tags)
				.leftJoin(tutorialsTags, eq(tags.id, tutorialsTags.tagId))
				.where(isNull(tutorialsTags.tutorialId));
			for (const tag of unusedTags) {
				await db.delete(tags).where(eq(tags.id, tag.id));
			}

			return c.json(tutorial, 200);
		} catch (e) {
			return errorResponse(c, {
				message: "Failed to update tutorial",
				type: "SERVER_ERROR",
			});
		}
	})
	.openapi(generateContent, async (c) => {
		const content = c.req.valid("json").content;
		const generatedContent = await generateContentFromContent(content);
		if (!generatedContent) {
			return errorResponse(c, {
				message: "Failed to generate content",
				type: "SERVER_ERROR",
			});
		}
		return c.json(generatedContent, 200);
	})
	.openapi(generateMetadata, async (c) => {
		const content = c.req.valid("json").content;
		const generatedMetadata = await generateMetadataFromContent(content);
		if (!generatedMetadata) {
			return errorResponse(c, {
				message: "Failed to generate metadata",
				type: "SERVER_ERROR",
			});
		}
		return c.json(generatedMetadata, 200);
	});

export default app;
