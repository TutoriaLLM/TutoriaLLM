import express from "express";
import { db } from "../db/index.js";
import { tutorials, tags, tutorialsTags } from "../db/schema.js";
import { eq, inArray } from "drizzle-orm";

// debug
console.log("tutorials/index.ts: Loading tutorial API app");

// 外部向けのチュートリアルタグエンドポイント(編集不可)
const tagsAPI = express();

/**
 * @openapi
 * /tutorial/tags:
 *   get:
 *     description: Returns all tags used in tutorials
 *     responses:
 *       200:
 *         description: A list of tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Failed to fetch tags
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch tags
 */
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

// 404 handler
tagsAPI.all("*", (req, res) => {
	res.status(404).send("Not Found");
});

export default tagsAPI;
