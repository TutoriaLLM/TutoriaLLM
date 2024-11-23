import express from "express";
import { db } from "../db/index.js";
import { type Tutorial, tags, tutorials, tutorialsTags } from "../db/schema.js";
import { and, eq, isNull } from "drizzle-orm";
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

		// 関連する tutorialsTags を先に削除
		await db.delete(tutorialsTags).where(eq(tutorialsTags.tutorialId, id));

		// tutorials のレコードを削除
		await db.delete(tutorials).where(eq(tutorials.id, id));

		// 未使用のタグを削除
		const unusedTags = await db
			.select({ id: tags.id })
			.from(tags)
			.leftJoin(tutorialsTags, eq(tags.id, tutorialsTags.tagId))
			.where(isNull(tutorialsTags.tutorialId));
		for (const tag of unusedTags) {
			await db.delete(tags).where(eq(tags.id, tag.id));
		}

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
	console.log(tutorial);
	//新しいチュートリアルを作成
	try {
		const insertedTutorial = await db
			.insert(tutorials)
			.values({
				content: tutorial.content,
				metadata: {
					...tutorial.metadata,
					selectCount: 0,
				},
				language: tutorial.language,
				serializednodes: tutorial.serializednodes,
				tags: tutorial.tags || [], // Add the tags property
			})
			.returning({ id: tutorials.id });

		// タグを tutorialsTags テーブルに追加
		if (tutorial.tags && tutorial.tags.length > 0) {
			for (const tag of tutorial.tags) {
				let existingTag = await db
					.select()
					.from(tags)
					.where(eq(tags.name, tag));

				if (existingTag.length === 0) {
					// タグが存在しない場合は作成
					const [newTag] = await db
						.insert(tags)
						.values({ name: tag })
						.returning({ id: tags.id });
					existingTag = [
						{
							id: newTag.id,
							name: tag,
						},
					];
				}

				// tutorialsTags テーブルに関連付けを追加
				await db.insert(tutorialsTags).values({
					tutorialId: insertedTutorial[0].id,
					tagId: existingTag[0].id,
				});
			}
		}

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
				language: tutorialToUpdate.language,
				serializednodes: tutorialToUpdate.serializednodes,
			})
			.where(eq(tutorials.id, id));

		// タグの更新
		if (tutorialToUpdate.tags && tutorialToUpdate.tags.length > 0) {
			// 既存のタグ関連付けを削除
			await db.delete(tutorialsTags).where(eq(tutorialsTags.tutorialId, id));

			// 新しいタグを tutorialsTags テーブルに追加
			for (const tag of tutorialToUpdate.tags) {
				let existingTag = await db
					.select()
					.from(tags)
					.where(eq(tags.name, tag));

				if (existingTag.length === 0) {
					// タグが存在しない場合は作成
					const [newTag] = await db
						.insert(tags)
						.values({ name: tag })
						.returning({ id: tags.id });
					existingTag = [
						{
							id: newTag.id,
							name: tag,
						},
					];
				}

				// tutorialsTags テーブルに関連付けを追加
				await db.insert(tutorialsTags).values({
					tutorialId: id,
					tagId: existingTag[0].id,
				});
			}
		}

		// 未使用のタグを削除
		const unusedTags = await db
			.select({ id: tags.id })
			.from(tags)
			.leftJoin(tutorialsTags, eq(tags.id, tutorialsTags.tagId))
			.where(isNull(tutorialsTags.tutorialId));
		for (const tag of unusedTags) {
			await db.delete(tags).where(eq(tags.id, tag.id));
		}

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
