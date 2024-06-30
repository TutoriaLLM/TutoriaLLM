import express from "express";
import { db } from "../db/index.js";
import { Tutorial, UpdatedTutorial, NewTutorial } from "../../type.js";
import { extractMetadata } from "../../utils/extractTutorialMetadata.js";

//内部向けのチュートリアルエンドポイント(編集可能)
const tutorialsManager = express.Router();
tutorialsManager.use(express.json());

//全てのチュートリアルを取得
tutorialsManager.get("/", async (req, res) => {
  try {
    const tutorials = await db.selectFrom("tutorials").selectAll().execute();
    res.json(tutorials);
  } catch (e) {
    console.error(e);
    res.status(500).send("Failed to fetch tutorials");
  }
});

//チュートリアルの内容を取得
tutorialsManager.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
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

//チュートリアルを削除
tutorialsManager.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.deleteFrom("tutorials").where("id", "=", id).execute();
    res.send(`Tutorial ${id} deleted`);
  } catch (e) {
    console.error(e);
    res.status(500).send("Failed to delete tutorial");
  }
});

//新しいチュートリアルを作成
tutorialsManager.post("/new", async (req, res) => {
  if (!req.body.content) {
    res.status(400).send("Body is required");
    return;
  }
  const tutorial = req.body.content as string;
  const extractMetadataToInsert = extractMetadata(tutorial);
  const content = extractMetadataToInsert.content;
  const metadata = extractMetadataToInsert.metadata;
  console.log(content);
  console.log(metadata);
  //新しいチュートリアルを作成
  try {
    await db
      .insertInto("tutorials")
      .values({
        content: content,
        metadata: JSON.stringify(metadata),
      } as NewTutorial)
      .execute();
    res.status(201).send("Tutorial created");
  } catch (e) {
    console.error(e);
    res.status(500).send("Failed to create tutorial");
  }
});

//チュートリアルの内容を更新
tutorialsManager.post("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const tutorial = await db
      .selectFrom("tutorials")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
    if (!tutorial) {
      res.status(404).send("Not Found");
      return;
    }
    if (!req.body.content) {
      res.status(400).send("Bad Request");
      return;
    }
    const tutorialToUpdate = req.body.content as string;
    const extractMetadataToUpdate = extractMetadata(tutorialToUpdate);
    const content = extractMetadataToUpdate.content;
    const metadata = extractMetadataToUpdate.metadata;
    //チュートリアルの内容を更新
    await db
      .updateTable("tutorials")
      .set({
        content: content,
        metadata: JSON.stringify(metadata),
      })
      .where("id", "=", id)
      .execute();
    res.send(`Tutorial ${id} updated`);
  } catch (e) {
    console.error(e);
    res.status(500).send("Failed to update tutorial");
  }
});

tutorialsManager.all("*", (req, res) => {
  res.status(404).send("Not Found");
});

export default tutorialsManager;
