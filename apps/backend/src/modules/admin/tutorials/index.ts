import { db } from "@/db";
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
import { tags, tutorials, tutorialsTags } from "@/db/schema";

/**
 * This controller handles admin-based tutorial management.
 * It includes CRUD operations for tutorials, as well as AI-based generation
 * of tutorial content and metadata.
 */
const app = createHonoApp()
	/**
	 * Get the list of all tutorials
	 */
	.openapi(getTutorialList, async (c) => {
		const allTutorials = await db
			.select() // Might be better to eliminate unnecessary fields.
			.from(tutorials);

		return c.json(allTutorials, 200);
	})
	/**
	 * Get a specific tutorial by its ID
	 */
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
	/**
	 * Delete a specific tutorial by its ID
	 */
	.openapi(deleteTutorial, async (c) => {
		const id = c.req.valid("param").id;
		// Delete tutorialsTags related to this tutorial
		await db.delete(tutorialsTags).where(eq(tutorialsTags.tutorialId, id));

		// Delete the tutorial record
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
	/**
	 * Create a new tutorial
	 */
	.openapi(createTutorial, async (c) => {
		const data = c.req.valid("json");
		try {
			// Insert tutorial and return the created ID and tags
			const tutorial = await db
				.insert(tutorials)
				.values(data)
				.returning({ id: tutorials.id, tags: tutorials.tags });

			// If there are tags, handle the tag creation/association
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

					// Associate the tag to the tutorial in tutorialsTags table
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
	/**
	 * Update a tutorial by its ID
	 */
	.openapi(updateTutorial, async (c) => {
		const id = c.req.valid("param").id;
		try {
			const tutorial = await db
				.select()
				.from(tutorials)
				.where(eq(tutorials.id, id));

			if (!tutorial || tutorial.length === 0) {
				return errorResponse(c, {
					message: "Tutorial not found",
					type: "NOT_FOUND",
				});
			}

			const tutorialToUpdate = c.req.valid("json");

			// Update the tutorial content/metadata
			await db
				.update(tutorials)
				.set({
					content: tutorialToUpdate.content,
					metadata: tutorialToUpdate.metadata,
					language: tutorialToUpdate.language,
					serializednodes: tutorialToUpdate.serializednodes,
				})
				.where(eq(tutorials.id, id));

			// Handle tag updates
			if (tutorialToUpdate.tags && tutorialToUpdate.tags.length > 0) {
				// First, delete existing tag associations
				await db.delete(tutorialsTags).where(eq(tutorialsTags.tutorialId, id));

				// Then, create new tag associations
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

					// Associate the new/updated tag to the tutorial
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
	/**
	 * Generate tutorial content using AI
	 */
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
	/**
	 * Generate tutorial metadata using AI
	 */
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
