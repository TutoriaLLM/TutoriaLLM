import type { Dialogue, SessionValue } from "../../../../type.js";
import { updateDialogue } from "../../../../utils/dialogueUpdater.js";
import { tutorials } from "../../../db/schema.js";
import { sessionDB } from "../../../db/session.js";
import { invokeLLM } from "../../llm/index.js";
import { getAvailableBlocks, getBlockFiles } from "../../registerBlocks.js";

//非同期でLLMを呼び出し、メッセージが作成されたタイミングでプッシュする
export async function updateDialogueWithLLM(
	data: SessionValue,
): Promise<SessionValue> {
	//処理が終わり、最終データを返す際直前のデータを再取得する
	async function getLatestData(code: string) {
		const rawData = await sessionDB.get(code);
		const data: SessionValue = rawData ? JSON.parse(rawData) : null;
		return data;
	}

	console.log("updateDialogueLLM");
	const language = data.language;

	const blockFiles = await getBlockFiles();
	const availableBlocks = await getAvailableBlocks(blockFiles, language);
	const extractedBlockNames = availableBlocks.map((block) => block.block.type);

	const message = await invokeLLM(data, extractedBlockNames);

	if (message) {
		console.log(message);
		let updatedDialogue = updateDialogue(message.response, data, "ai");

		// quick replies
		const updatedQuickReplies = [...data.quickReplies];
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
					...updatedDialogue.dialogue,
					{
						id: updatedDialogue.dialogue.length + 1,
						contentType: "ui",
						ui: message.ui,
						isuser: false,
						content: "",
					},
				],
			};
		}
		return {
			...data,
			dialogue: updatedDialogue.dialogue,
			quickReplies: updatedQuickReplies,
			isReplying: false,
			tutorial: {
				...data.tutorial,
				progress: message.progress,
			},
		};
	}

	//失敗した場合、最新のデータを取得してそのまま返す
	const latestData = await getLatestData(code);
	latestData.isReplying = false;
	return latestData;
}
