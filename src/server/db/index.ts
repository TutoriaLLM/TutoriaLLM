import { Level } from "level";
import express from "express";
import joincodeGen from "../utils/joincodeGen.js";

const router = express.Router();

//複数セッションを管理するのに使用するコードとデータを保存するDB
const sessionDB = new Level("dist/session", { valueEncoding: "json" });

router.get("/new", async (req, res) => {
  //参加コードを生成
  const code = await joincodeGen();
  //生成したコードが重複していないか確認
  const value = await sessionDB.get(code).catch(() => null);
  if (value) {
    res.status(500).send("Failed to create session: code already exists");
    return;
  }
  await sessionDB.put(code, "{ code, data: {} }");
  res.send("Session created:" + code);
});

router.get("/:key", async (req, res) => {
  const value = await sessionDB.get(req.params.key);
  res.send(value);
});

router.delete("/:key", async (req, res) => {
  await sessionDB.del(req.params.key);
  res.send("Session deleted");
});

router.all("*", (req, res) => {
  res.status(404).send("Not Found");
});

export default router;
