import express from "express";
import { tutorialDB } from "../db/tutorials.js";
import { TutorialData } from "../../type.js";
import { extractMetadata } from "../../utils/extractTutorialMetadata.js";

//内部向けのチュートリアルエンドポイント(編集可能)
const tutorialsManager = express.Router();
tutorialsManager.use(express.json());

//全てのチュートリアルを取得
tutorialsManager.get("/", (req, res) => {
  const tutorials = tutorialDB
    .prepare("SELECT * FROM tutorials")
    .all() as TutorialData[];
  res.json(tutorials);
});

//チュートリアルの内容を取得
tutorialsManager.get("/:id", (req, res) => {
  res.send(`Tutorial ${req.params.id}`);
});

//チュートリアルを削除
tutorialsManager.delete("/:id", (req, res) => {
  const id = req.params.id;
  //idに対応するチュートリアルを削除
  tutorialDB.prepare("DELETE FROM tutorials WHERE id = ?").run(id);
  res.send(`Tutorial ${id} deleted`);
});

//チュートリアルの内容を更新
tutorialsManager.post("/:id", (req, res) => {
  const id = req.params.id;
  //idに対応するチュートリアルを取得
  const tutorial = tutorialDB
    .prepare("SELECT * FROM tutorials WHERE id = ?")
    .get(id) as TutorialData;
  if (!tutorial) {
    res.status(404).send("Not Found");
    return;
  }
  if (!req.body || typeof req.body !== "string") {
    res.status(400).send("Bad Request");
    return;
  }
  const tutorialToUpdate = req.body as string;
  const extractMetadataToUpdate = extractMetadata(tutorialToUpdate);
  const content = extractMetadataToUpdate.content;
  const metadata = extractMetadataToUpdate.metadata;
  //チュートリアルの内容を更新
  tutorialDB
    .prepare("UPDATE tutorials SET content = ? metadata = ? WHERE id = ?")
    .run(content, metadata, id);
});

//新しいチュートリアルを作成
tutorialsManager.post("/new", (req, res) => {
  if (!req.body || typeof req.body !== "string") {
    res.status(400).send("Bad Request");
    return;
  }
  const tutorial = req.body as string;
  const extractMetadataToInsert = extractMetadata(tutorial);
  const content = extractMetadataToInsert.content;
  const metadata = extractMetadataToInsert.metadata;
  //新しいチュートリアルを作成
  tutorialDB
    .prepare("INSERT INTO tutorials (content, metadata) VALUES (?, ?)")
    .run(content, metadata);
  res.send("Tutorial created");
});

tutorialsManager.all("*", (req, res) => {
  res.status(404).send("Not Found");
});

export default tutorialsManager;
