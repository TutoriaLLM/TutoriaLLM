import express from "express";

import { trainingData } from "../../db/schema.js";
import { db } from "../../db/index.js";
import { eq, sql } from "drizzle-orm";

//トレーニングに用いるデータを管理するAPI。このデータを編集or承認したものがガイドとしてAIに反映される、一時的な保存場所。Adminのみアクセス可能。
const trainingDataManager = express.Router();

/**
 * @openapi
 * /admin/training/data/random:
 *   get:
 *     description: Returns a random training data
 *     responses:
 *       200:
 *         description: A random training data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: No data found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: No data found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Failed to fetch data
 */
//ランダムなトレーニングデータを取得するAPI
trainingDataManager.get("/random", async (req, res) => {
	try {
		const data = await db
			.select()
			.from(trainingData)
			.orderBy(sql`random()`)
			.limit(1);
		if (data.length === 0) {
			res.status(404).send("No data found");
			return;
		}
		res.json(data[0]);
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to fetch data");
	}
});

/**
 * @openapi
 * /admin/training/data/list:
 *   get:
 *     description: Returns a list of all training data
 *     responses:
 *       200:
 *         description: A list of all training data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: No data found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: No data found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Failed to fetch data
 */
//トレーニングデータをリストするAPI
trainingDataManager.get("/list", async (req, res) => {
	try {
		const data = await db.select().from(trainingData);
		res.json(data);
		if (data.length === 0) {
			res.status(404).send("No data found");
			return;
		}
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to fetch data");
	}
});

/**
 * @openapi
 * /admin/training/data/{id}:
 *   delete:
 *     description: Deletes a training data by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Training data deleted
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: data {id} deleted
 *       500:
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Failed to delete data
 */
//トレーニングデータを削除するAPI
trainingDataManager.delete("/:id", async (req, res) => {
	try {
		const id = Number.parseInt(req.params.id, 10);
		await db.delete(trainingData).where(eq(trainingData.id, id));
		res.send(`data ${id} deleted`);
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to delete data");
	}
});

export default trainingDataManager;
