import express from "express";
import appConfiguration from "./appConfig.js";
import usersConfiguration from "./userConfig.js";
import sessionManager from "./sessionManager.js";

// 管理者ページが使用するAPIのエントリーポイント
const admin = express.Router();

// 権限がない場合は、管理者ページにアクセスできないようにする
admin.use((req, res, next) => {
  if (!res.locals.user) {
    return res.status(401).json({ message: "認証情報がありません" });
  }
  return next();
});

// アプリ全体のConfigを設定するAPI
admin.use("/config", appConfiguration);

// DBrouterからセッションのより詳細な情報を取得する
admin.use("/sessions", sessionManager);

//チュートリアルのガイドのDBを操作するAPI
//ガイドの追加、削除、編集、インポート、エクスポートなど

//ユーザーの管理を行うAPI
admin.use("/users", usersConfiguration);

export default admin;
