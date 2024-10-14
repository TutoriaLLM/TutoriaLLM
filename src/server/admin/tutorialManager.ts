import express from "express";
import { db } from "../db/index.js";
import {
	type Tutorial,
	type TutorialMetadata,
	tutorials,
} from "../db/schema.js";
import { eq } from "drizzle-orm";
import { generateContent } from "./llm/tutorial.js";
import { getAvailableBlocks } from "../session/registerBlocks.js";
import { generateMetadata } from "./llm/metadata.js";

//内部向けのチュートリアルエンドポイント(編集可能)
const tutorialsManager = express.Router();
tutorialsManager.use(express.json());

//全てのチュートリアルを取得
tutorialsManager.get("/", async (req, res) => {
	try {
		const getAlltutorials = await db.select().from(tutorials);

		res.json(getAlltutorials);
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to fetch tutorials");
	}
});

// チュートリアルの内容を取得
tutorialsManager.get("/:id", async (req, res) => {
	try {
		const id = Number.parseInt(req.params.id, 10);
		const tutorial = await db
			.select()
			.from(tutorials)
			.where(eq(tutorials.id, id));

		if (tutorial.length > 0) {
			// 配列の最初の要素だけを返す
			res.json(tutorial[0]);
		} else {
			res.status(404).send("Not Found");
		}
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to fetch tutorial");
	}
});

//チュートリアルを削除
tutorialsManager.delete("/:id", async (req, res) => {
	try {
		const id = Number.parseInt(req.params.id, 10);
		await db.delete(tutorials).where(eq(tutorials.id, id));
		res.send(`Tutorial ${id} deleted`);
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to delete tutorial");
	}
});

//新しいチュートリアルを作成
tutorialsManager.post("/new", async (req, res) => {
	if (!req.body) {
		res.status(400).send("Body is required");
		return;
	}
	const tutorial = req.body as Tutorial;
	//新しいチュートリアルを作成
	try {
		await db.insert(tutorials).values({
			content: tutorial.content,
			metadata: tutorial.metadata,
			serializednodes: tutorial.serializednodes,
		});
		res.status(201).send("Tutorial created");
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to create tutorial");
	}
});

//チュートリアルの内容を更新
tutorialsManager.put("/:id", async (req, res) => {
	const id = Number.parseInt(req.params.id, 10);
	try {
		const tutorial = await db
			.select()
			.from(tutorials)
			.where(eq(tutorials.id, id));
		if (!tutorial) {
			res.status(404).send("Not Found");
			return;
		}
		if (!req.body) {
			res.status(400).send("Bad Request");
			return;
		}
		const tutorialToUpdate = req.body as Tutorial;
		//チュートリアルの内容を更新
		await db
			.update(tutorials)
			.set({
				content: tutorialToUpdate.content,
				metadata: tutorialToUpdate.metadata,
				serializednodes: tutorialToUpdate.serializednodes,
			})
			.where(eq(tutorials.id, id));
		res.send(`Tutorial ${id} updated`);
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to update tutorial");
	}
});

//チュートリアル作成の際にAIを使用してコンテンツを生成する
tutorialsManager.post("/generate-content", async (req, res) => {
	const content = req.body.content;

	const generatedContent = await generateContent(content);
	if (!generatedContent) {
		res.status(500).send("Failed to generate content");
		return;
	}
	res.json(generatedContent);
});

//チュートリアル作成の際にAIを使用してコンテンツからメタデータを生成する
tutorialsManager.post("/generate-metadata", async (req, res) => {
	const content = req.body.content;

	const generatedMetadata = await generateMetadata(content);
	if (!generatedMetadata) {
		res.status(500).send("Failed to generate metadata");
		return;
	}
	res.json(generatedMetadata);
});

tutorialsManager.all("*", (req, res) => {
	res.status(404).send("Not Found");
});

export default tutorialsManager;
