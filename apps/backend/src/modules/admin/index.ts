import { createHonoApp } from "@/create-app";
import { errorResponse } from "@/libs/errors";
import appConfigRoute from "@/modules/admin/config";
import sessionManagerRoute from "@/modules/admin/session";
import trainingManagerRoute from "@/modules/admin/training";
import tutorialsManagerRoute from "@/modules/admin/tutorials";
import userRoute from "@/modules/admin/users";

// 管理者ページが使用するAPIのエントリーポイント
const app = createHonoApp()
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
