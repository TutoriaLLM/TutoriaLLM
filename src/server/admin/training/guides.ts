import express from "express";
import {
	type Guide,
	guides,
	trainingData,
	type TrainingData,
} from "../../db/schema.js";
import { db } from "../../db/index.js";
import { cosineDistance, desc, eq, gt, sql } from "drizzle-orm";
import { generateEmbedding } from "./embedding.js";

//トレーニングデータをもとに作成されるガイドを管理するAPI。取得を除きAdminのみアクセス可能。

const guideManager = express.Router();

async function createGuideFromTrainingData(
	trainingData: TrainingData,
): Promise<Guide> {
	//TrainingDataをもとに埋め込みようのデータを作成
	const data = await generateEmbedding(trainingData.question);

	return {
		id: trainingData.id,
		metadata: trainingData.metadata,
		question: trainingData.question,
		answer: trainingData.answer,
		embedding: data,
	};
}

/**
 * @openapi
 * components:
 *   schemas:
 *     TrainingData:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         metadata:
 *           type: object
 *         question:
 *           type: string
 *         answer:
 *           type: string
 *     Guide:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         metadata:
 *           type: object
 *         question:
 *           type: string
 *         answer:
 *           type: string
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 */

/**
 * @openapi
 * /admin/training/guide/new:
 *   post:
 *     description: API to create a new guide from training data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TrainingData'
 *     responses:
 *       201:
 *         description: Guide created
 *       400:
 *         description: Body is required
 *       500:
 *         description: Failed to create guide
 */
guideManager.post("/new", async (req, res) => {
	if (!req.body) {
		res.status(400).send("Body is required");
		return;
	}
	//TrainingData(上書き)またはTrainingDataのid(承認)を受け取る
	const data = req.body as TrainingData;
	//新しいガイドを作成
	try {
		const createdGuide = await createGuideFromTrainingData(data);
		await db.insert(guides).values(createdGuide);
		//dataにある同一のIDを持つTrainingDataを削除
		await db.delete(trainingData).where(eq(trainingData.id, data.id));
		res.status(201).send("Guide created");
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to create guide");
	}
});
//Vectorをもとに知識を検索するAPI
export async function getKnowledge(
	searchString: string,
): Promise<Guide[] | string> {
	const embedding = await generateEmbedding(searchString);
	const similarity = sql<number>`1 - (${cosineDistance(guides.embedding, embedding)})`;
	try {
		const similarGuides = await db
			.select()
			.from(guides)
			.where(gt(similarity, 0.3))
			.orderBy((t) => desc(similarity))
			.limit(5);
		return similarGuides;
	} catch (e) {
		console.error(e);
		return "Failed to search guides";
	}
}
/**
 * @openapi
 * /admin/training/guide/search:
 *   post:
 *     description: API to search knowledge based on vector
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *     responses:
 *       200:
 *         description: A list of guides
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Guide'
 *       400:
 *         description: Body is required
 *       500:
 *         description: Failed to search guides
 */
guideManager.post("/search", async (req, res) => {
	if (!req.body) {
		res.status(400).send("Body is required");
		return;
	}
	type SearchRequest = {
		query: string;
	};
	const searchString = req.body as SearchRequest;
	const result = await getKnowledge(searchString.query);
	if (typeof result === "string") {
		res.status(500).send(result);
	}
	res.json(result);
});
/**
 * @openapi
 * /admin/training/guide/list:
 *   get:
 *     description: API to get a list of guides
 *     responses:
 *       200:
 *         description: A list of guides
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Guide'
 *       404:
 *         description: No guides found
 *       500:
 *         description: Failed to fetch guides
 */
guideManager.get("/list", async (req, res) => {
	try {
		const guidesList = await db.select().from(guides);
		if (guidesList.length === 0) {
			res.status(404).send("No guides found");
			return;
		}
		res.json(guidesList);
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to fetch guides");
	}
});
/**
 * @openapi
 * /admin/training/guide/{id}:
 *   get:
 *     description: API to get a guide content by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A guide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Guide'
 *       500:
 *         description: Failed to fetch guide
 */
guideManager.get("/:id", async (req, res) => {
	const id = Number.parseInt(req.params.id, 10);
	try {
		const guide = await db.select().from(guides).where(eq(guides.id, id));
		res.json(guide);
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to fetch guide");
	}
});
/**
 * @openapi
 * /admin/training/guide/{id}:
 *   put:
 *     description: API to update or create a guide by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TrainingData'
 *     responses:
 *       201:
 *         description: Guide updated
 *       400:
 *         description: Body is required
 *       500:
 *         description: Failed to update guide
 */
guideManager.put("/:id", async (req, res) => {
	if (!req.body) {
		res.status(400).send("Body is required");
		return;
	}
	const id = Number.parseInt(req.params.id, 10);
	const data = req.body as TrainingData;
	try {
		const createdGuide = await createGuideFromTrainingData(data);
		await db
			.update(guides)
			.set({
				metadata: createdGuide.metadata,
				question: createdGuide.question,
				answer: createdGuide.answer,
				embedding: createdGuide.embedding,
			})
			.where(eq(guides.id, id));
		res.status(201).send("Guide updated");
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to update guide");
	}
});
/**
 * @openapi
 * /admin/training/guide/{id}:
 *   delete:
 *     description: API to delete a guide by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Guide deleted
 *       500:
 *         description: Failed to delete guide
 */
guideManager.delete("/:id", async (req, res) => {
	try {
		const id = Number.parseInt(req.params.id, 10);
		await db.delete(guides).where(eq(guides.id, id));
		res.send(`Guide ${id} deleted`);
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to delete guide");
	}
});

export default guideManager;
