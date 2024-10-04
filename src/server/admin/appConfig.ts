import * as path from "node:path";
import express from "express";
import type { AppConfig } from "../../type.js";
import { getConfig, updateConfig } from "../getConfig.js";

const appConfiguration = express.Router();

// JSONボディパーサーを追加
appConfiguration.use(express.json());

//設定ファイルを更新するか、作成する
appConfiguration.post("/update", (req, res) => {
	const newConfig: AppConfig = req.body;
	updateConfig(newConfig);
	res.send("Config updated");
});

//設定ファイルを取得し、存在しない場合は作成する
appConfiguration.get("/", async (req, res) => {
	const config: AppConfig = await getConfig();
	res.json(config);
});

export default appConfiguration;
