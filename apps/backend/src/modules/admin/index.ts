import type { Context } from "../../context.js";
import { errorResponse } from "../../libs/errors/index.js";
import appConfigRoute from "./config";
import sessionManagerRoute from "./session";
import trainingManagerRoute from "./training";
import tutorialsManagerRoute from "./tutorials";
import userRoute from "./users";
import { OpenAPIHono } from "@hono/zod-openapi";

// 管理者ページが使用するAPIのエントリーポイント
const app = new OpenAPIHono<Context>();
// 権限がない場合は、管理者ページにアクセスできないようにする
app.use("/admin", async (c, next) => {
	if (!c.get("user")) {
		return errorResponse(c, {
			message: "Unauthorized",
			type: "UNAUTHORIZED",
		});
	}
	return next();
});

// アプリ全体のConfigを設定するAPI
app.route("/", appConfigRoute);

// DBrouterからセッションのより詳細な情報を取得する
app.route("/", sessionManagerRoute);

//チュートリアルのガイドのDBを操作するAPI
app.route("/", tutorialsManagerRoute);

//ユーザーの管理を行うAPI
app.route("/", userRoute);

//AIのトレーニングデータの管理を行うAPI
app.route("/", trainingManagerRoute);

export default app;
