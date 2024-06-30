import express from "express";
import { db } from "../db/index.js";

//外部向けのチュートリアルエンドポイント(編集不可)
const tutorials = express();

//全てのチュートリアルを取得
tutorials.get("/", async (req, res) => {
	try {
		const tutorials = await db.selectFrom("tutorials").selectAll().execute();
		res.json(tutorials);
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to fetch tutorials");
	}
});

//チュートリアルの内容を取得
tutorials.get("/:id", async (req, res) => {
	try {
		const id = Number.parseInt(req.params.id, 10);
		const tutorial = await db
			.selectFrom("tutorials")
			.selectAll()
			.where("id", "=", id)
			.executeTakeFirst();
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

tutorials.all("*", (req, res) => {
	res.status(404).send("Not Found");
});

export default tutorials;
