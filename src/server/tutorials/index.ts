import express from "express";
import { db } from "../db/index.js";
import { tags, tutorials } from "../db/schema.js";
import { eq } from "drizzle-orm";
import tagsAPI from "./tags.js";

//debug
console.log("tutorials/index.ts: Loading tutorial api app");

//外部向けのチュートリアルエンドポイント(編集不可)
const tutorialsAPI = express();

//タグAPIを追加
tutorialsAPI.use("/tags", tagsAPI);

/**
 * @openapi
 * /tutorial:
 *   get:
 *     description: Returns a list of tutorials without content
 *     responses:
 *       200:
 *         description: A list of tutorials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   metadata:
 *                     type: object
 *                   language:
 *                     type: string
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *       404:
 *         description: Not Found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Not Found
 *       500:
 *         description: Failed to fetch tutorials
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Failed to fetch tutorials
 */
//チュートリアルの一覧を取得。コンテンツは送信しない。
//チュートリアルがない場合は404を送信する。
tutorialsAPI.get("/", async (req, res) => {
	try {
		const getTutorials = await db
			.select({
				id: tutorials.id,
				metadata: tutorials.metadata,
				language: tutorials.language,
				tags: tutorials.tags,
			})
			.from(tutorials);

		if (getTutorials.length === 0) {
			res.status(404).send("Not Found");
		} else {
			res.json(getTutorials);
		}
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to fetch tutorials");
	}
});

/**
 * @openapi
 * /tutorial/{id}:
 *   get:
 *     description: Returns the content of a tutorial
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The content of the tutorial
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Not Found
 *         content:
 *           text/plain
 *             schema:
 *               type: string
 *               example: Not Found
 *       500:
 *         description: Failed to fetch tutorial
 *         content:
 *           text/plain
 *             schema:
 *               type: string
 *               example: Failed to fetch tutorial
 */
//チュートリアルの内容を取得
tutorialsAPI.get("/:id", async (req, res) => {
	try {
		const id = Number.parseInt(req.params.id, 10);
		const tutorial = await db.query.tutorials.findFirst({
			where: eq(tutorials.id, id),
		});

		if (tutorial) {
			res.json(tutorial);
		} else {
			res.status(404).send("Not Found");
		}
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to fetch tutorial");
	}
});

tutorialsAPI.all("*", (req, res) => {
	res.status(404).send("Not Found");
});

export default tutorialsAPI;
