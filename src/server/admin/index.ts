import express from "express";
import appConfiguration from "./appConfig.js";
import sessionManager from "./sessionManager.js";
import tutorialsManager from "./tutorialManager.js";
import usersConfiguration from "./userConfig.js";
import trainingManager from "./training/index.js";

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
admin.use("/tutorials", tutorialsManager);

//ユーザーの管理を行うAPI
admin.use("/users", usersConfiguration);

//AIのトレーニングデータの管理を行うAPI
admin.use("/training", trainingManager);

export default admin;
