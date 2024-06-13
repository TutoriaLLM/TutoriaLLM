import express from "express";
import appConfiguration from "./configuration.js";

// 管理者ページが使用するAPIのエントリーポイント
const admin = express.Router();

// アプリ全体のConfigを設定するAPI
admin.use("/config", appConfiguration);

//チュートリアルのガイドのDBを操作するAPI
//ガイドの追加、削除、編集、インポート、エクスポートなど

export default admin;
