import { Level } from "level";
import express from "express";
import joincodeGen from "../../utils/joincodeGen.js";
import { SessionValue } from "../../type.js";

const DBrouter = express.Router();

//複数セッションを管理するのに使用するコードとデータを保存するDB
export const sessionDB = new Level("dist/session", { valueEncoding: "json" });

function intitialData(code: string, language: string): SessionValue {
  return {
    sessioncode: code,
    uuid: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    dialogue: [
      {
        contentType: "ai",
        isuser: false,
        content: "Welcome to the session! ",
      },
    ],
    workspace: {},
    isVMRunning: false,
    clients: [],
    language: language,
  };
}

DBrouter.get("/new", async (req, res) => {
  //参加コードを生成
  const code = joincodeGen();
  //言語をクエリから取得し、存在しない場合は英語をデフォルトとする
  var language = req.query.language;
  if (language === undefined || !language) {
    language = "en";
  }
  //生成したコードが重複していないか確認
  const value = await sessionDB.get(code).catch(() => null);
  if (value === code) {
    res
      .status(500)
      .send("Failed to create session by api: code already exists");
    return;
  }
  await sessionDB.put(
    code,
    JSON.stringify(intitialData(code, language.toString()))
  );
  console.log("session created by api");
  res.send(code);
});

//get value from key
DBrouter.get("/:key", async (req, res) => {
  try {
    const value = await sessionDB.get(req.params.key);
    res.send(value);
  } catch (e) {
    res.status(404).send(null);
  }
});

//update value from key
DBrouter.put("/:key", async (req, res) => {
  const updateData: SessionValue = req.body;
  try {
    await sessionDB.put(req.params.key, JSON.stringify(updateData));
    res.send("Session updated by api");
  } catch (e) {
    res.status(404).send(null);
  }
});

//delete value from key
DBrouter.delete("/:key", async (req, res) => {
  try {
    await sessionDB.get(req.params.key);
    res.send("Session deleted");
  } catch (e) {
    res.status(404).send(null);
  }
});

DBrouter.all("*", (req, res) => {
  res.status(404).send("Not Found");
});

export default DBrouter;
