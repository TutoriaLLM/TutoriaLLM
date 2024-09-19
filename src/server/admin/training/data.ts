import express from "express";

import { trainingData } from "../../db/schema.js";
import { db } from "../../db/index.js";
import { eq, sql } from "drizzle-orm";

//トレーニングに用いるデータを管理するAPI。このデータを編集or承認したものがガイドとしてAIに反映される、一時的な保存場所。Adminのみアクセス可能。
const trainingDataManager = express.Router();

//ランダムなトレーニングデータを取得するAPI
trainingDataManager.get("/random", async (req, res) => {
	try {
		const data = await db
			.select()
			.from(trainingData)
			.orderBy(sql`random()`)
			.limit(1);
		res.json(data[0]);
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to fetch data");
	}
});

//トレーニングデータをリストするAPI
trainingDataManager.get("/list", async (req, res) => {
	try {
		const data = await db.select().from(trainingData);
		res.json(data);
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to fetch data");
	}
});
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
