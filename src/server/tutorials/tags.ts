import express from "express";
import { db } from "../db/index.js";
import { tutorials, tags, tutorialsTags } from "../db/schema.js";
import { eq, inArray } from "drizzle-orm";

// debug
console.log("tutorials/index.ts: Loading tutorial API app");

// 外部向けのチュートリアルタグエンドポイント(編集不可)
const tagsAPI = express();

// チュートリアルで使われている全てのタグを取得
tagsAPI.get("/", async (req, res) => {
	try {
		const allTags = await db.select().from(tags);
		res.json(allTags);
	} catch (error) {
		console.error("Error fetching tags:", error);
		res.status(500).json({ error: "Failed to fetch tags" });
	}
});

// 複数タグの絞り込み機能でチュートリアルを取得
// tagsAPI.get("/filter", async (req, res) => {
// 	const tagNames = req.query.tags as string[];
// 	if (!tagNames || !Array.isArray(tagNames) || tagNames.length === 0) {
// 		return res
// 			.status(400)
// 			.json({ error: "Tags parameter is required and should be an array" });
// 	}

// 	try {
// 		const tagRecords = await db
// 			.select()
// 			.from(tags)
// 			.where(inArray(tags.name, tagNames));
// 		if (tagRecords.length !== tagNames.length) {
// 			return res.status(404).json({ error: "One or more tags not found" });
// 		}

// 		const tagIds = tagRecords.map((tag) => tag.id);

// 		const tutorialIds = await db
// 			.select({ tutorialId: tutorialsTags.tutorialId })
// 			.from(tutorialsTags)
// 			.where(inArray(tutorialsTags.tagId, tagIds));

// 		const tutorialList = await db
// 			.select()
// 			.from(tutorials)
// 			.where(
// 				inArray(
// 					tutorials.id,
// 					tutorialIds.map((t) => t.tutorialId),
// 				),
// 			);

// 		res.json(tutorialList);
// 	} catch (error) {
// 		console.error("Error fetching tutorials by tags:", error);
// 		res.status(500).json({ error: "Failed to fetch tutorials by tags" });
// 	}
// });

// 404 handler
tagsAPI.all("*", (req, res) => {
	res.status(404).send("Not Found");
});

export default tagsAPI;
