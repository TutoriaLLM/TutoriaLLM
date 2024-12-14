import { db } from "@/db";
import { appSessions } from "@/db/schema";
import { updateDialogue } from "@/utils/dialogueUpdater";

import { getBlockNames } from "@/libs/registerBlocks";
import type { SessionValue } from "@/modules/session/schema";
import { invokeLLM } from "@/modules/session/socket/llm";
import { eq } from "drizzle-orm";
import type { Socket } from "socket.io";

//非同期でLLMを呼び出し、メッセージが作成されたタイミングでプッシュする
export async function updateDialogueWithLLM(
	data: SessionValue,
	socket: Socket,
): Promise<SessionValue> {
	//処理が終わり、最終データを返す際直前のデータを再取得する
	async function getLatestData(code: string) {
		//RedisからPostgresに移行しました: from 1.0.0
		const rawData = await db
			.select()
			.from(appSessions)
			.where(eq(appSessions.sessioncode, code));

		const data: SessionValue = rawData[0];
		return data;
	}

	console.log("updateDialogueLLM");
	const language = data.language;

	const blockNames = await getBlockNames();

	const message = await invokeLLM(data, blockNames, socket);

	//出力が音声だった場合の処理
	//テスト目的なので、実際には音声ファイルを生成する処理が必要
	//bae64エンコードされた音声を保存し、DialogueにそのIDを追加する
	if (
		typeof message !== "string" &&
		message &&
		"data" in message &&
		message.data
	) {
		const latestData = await getLatestData(data.sessioncode);
		const updatedAudios = [
			...(latestData.audios || []),
			{
				id: `${(latestData.audios?.length || 0) + 1}`,
				base64: message.data,
			},
		];

		// オーディオの件数が5件を超えたら最新の5つが残るようにする
		if (updatedAudios.length > 5) {
			updatedAudios.splice(0, updatedAudios.length - 5);
		}

		return {
			...latestData,
			dialogue: [
				...(latestData.dialogue || []),
				{
					id: (data.dialogue?.length || 0) + 1,
					contentType: "ai_audio",
					isuser: false,
					content: JSON.stringify({
						id: `${updatedAudios.length}`,
						transcript: message.transcript,
					}),
				},
			],
			isReplying: false,
			audios: updatedAudios,
		};
	}

	//出力がテキストだった場合の処理
	if (typeof message !== "string" && message && "response" in message) {
		const latestData2 = await getLatestData(data.sessioncode);
		let updatedDialogue = updateDialogue(message.response, latestData2, "ai");

		// quick replies
		const updatedQuickReplies = [...(data.quickReplies || [])];
		if (message.quickReplies) {
			// 既存の配列を上書きする
			updatedQuickReplies.splice(0, updatedQuickReplies.length);
			for (const reply of message.quickReplies) {
				updatedQuickReplies.push(reply);
			}
		}

		if (message.ui) {
			updatedDialogue = {
				...updatedDialogue,
				dialogue: [
					...(updatedDialogue.dialogue || []),
					{
						id: (updatedDialogue.dialogue?.length || 0) + 1,
						contentType: "ui",
						ui: message.ui,
						isuser: false,
						content: "",
					},
				],
			};
		}
		const latestData = await getLatestData(data.sessioncode);
		return {
			...latestData,
			dialogue: updatedDialogue.dialogue,
			quickReplies: updatedQuickReplies,
			isReplying: false,
			tutorial: {
				...latestData.tutorial,
				progress: message.progress,
			},
		};
	}

	//メッセージが文字列だった場合の処理
	if (typeof message === "string") {
		const updatedDialogue = updateDialogue(message, data, "ai");
		const latestData = await getLatestData(data.sessioncode);
		return {
			...latestData,
			dialogue: updatedDialogue.dialogue,
			isReplying: false,
		};
	}

	//ユーザーの音声が含まれている場合はその音声を削除する
	if (data.userAudio) {
		const latestData = await getLatestData(data.sessioncode);
		latestData.userAudio = "";
		return latestData;
	}

	//失敗した場合、最新のデータを取得してそのまま返す
	const latestData = await getLatestData(data.sessioncode);
	latestData.isReplying = false;
	return latestData;
}
