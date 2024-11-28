import type { Context } from "../../context.js";
import { defaultHook } from "../../libs/default-hook.js";
import { errorResponse } from "../../libs/errors/index.js";
import appConfigRoute from "./config";
import sessionManagerRoute from "./session";
import trainingManagerRoute from "./training";
import tutorialsManagerRoute from "./tutorials";
import userRoute from "./users";
import { OpenAPIHono } from "@hono/zod-openapi";

// 管理者ページが使用するAPIのエントリーポイント
const app = new OpenAPIHono<Context>({ defaultHook })
	// 権限がない場合は、管理者ページにアクセスできないようにする
	.use("/admin/*", async (c, next) => {
		if (!c.get("user")) {
			return errorResponse(c, {
				message: "Unauthorized",
				type: "UNAUTHORIZED",
			});
		}
		return next();
	})
	// アプリ全体のConfigを設定するAPI
	.route("/", appConfigRoute)

	// // DBrouterからセッションのより詳細な情報を取得する
	.route("/", sessionManagerRoute)

	// //チュートリアルのガイドのDBを操作するAPI
	.route("/", tutorialsManagerRoute)

	// //ユーザーの管理を行うAPI
	.route("/", userRoute)

	//AIのトレーニングデータの管理を行うAPI
	.route("/", trainingManagerRoute);

export type AdminAppType = typeof app;
export default app;
