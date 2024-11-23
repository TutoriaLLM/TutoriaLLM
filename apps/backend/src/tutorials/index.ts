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
