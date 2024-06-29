import express from "express";
import { tutorialDB } from "../db/tutorials.js";
import { TutorialData } from "../../type.js";

//外部向けのチュートリアルエンドポイント(編集不可)
const tutorials = express();

//全てのチュートリアルを取得
tutorials.get("/", (req, res) => {
  const tutorials = tutorialDB
    .prepare("SELECT * FROM tutorials")
    .all() as TutorialData[];
  res.json(tutorials);
});

//チュートリアルの内容を取得
tutorials.get("/:id", (req, res) => {
  res.send(`Tutorial ${req.params.id}`);
});

tutorials.all("*", (req, res) => {
  res.status(404).send("Not Found");
});

export default tutorials;
