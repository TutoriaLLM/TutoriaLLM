import type { Dialogue, SessionValue } from "../../../type.js";
import { updateDialogue } from "../../../utils/dialogueUpdater.js";
import { updateStats } from "../../../utils/statsUpdater.js";
import { sessionDB } from "../../db/session.js";
import { invokeLLM } from "../llm/index.js";
import { getAvailableBlocks, getBlockFiles } from "../registerBlocks.js";
import updateDatabase from "./updateDB.js";

export async function updateSession(
	clients: Map<string, any>,
	currentDataJson: SessionValue,
	messageJson: SessionValue,
) {
	const {
		sessioncode,
		uuid,
		workspace,
		tutorial,
		llmContext,
		easyMode,
		dialogue,
		quickReplies,
		stats,
		language,
		screenshot,
		clicks,
	} = messageJson;

	const code = sessioncode;

	async function updateDialogueLLM(
		oldData: SessionValue,
		newData: SessionValue,
	): Promise<{
		dialogue: Dialogue[];
		quickReplies: string[];
		isreplying: boolean;
		progress: number;
	}> {
		const lastMessage = newData.dialogue[newData.dialogue.length - 1];

		if (
			newData.dialogue !== oldData.dialogue &&
			newData.dialogue.length > 0 &&
			lastMessage.isuser
		) {
			const blockFiles = await getBlockFiles();
			const availableBlocks = await getAvailableBlocks(blockFiles, language);
			const extractedBlockNames = availableBlocks.map(
				(block) => block.block.type,
			);

			const message = await invokeLLM(messageJson, extractedBlockNames);

			if (message) {
				console.log(message);
				let updatedDialogue = updateDialogue(
					message.response,
					messageJson,
					"ai",
				);

				// quick replies
				const updatedQuickReplies = [...quickReplies];
				if (message.quickReplies) {
					// 既存の配列を上書きする
					updatedQuickReplies.splice(0, updatedQuickReplies.length);
					for (const reply of message.quickReplies) {
						updatedQuickReplies.push(reply);
					}
				}

				if (message.blockId) {
					updatedDialogue = updateDialogue(
						message.blockId,
						updatedDialogue,
						"blockId",
					);
				}

				if (message.blockName) {
					updatedDialogue = updateDialogue(
						message.blockName,
						updatedDialogue,
						"blockName",
					);
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
					dialogue: updatedDialogue.dialogue,
					quickReplies: updatedQuickReplies,
					isreplying: false,
					progress: message.progress,
				};
			}
		}

		return {
			dialogue: newData.dialogue,
			quickReplies: quickReplies, // unchanged if no update is needed
			isreplying: false,
			progress: newData.tutorial.progress,
		};
	}

	const llmUpdateNeeded =
		messageJson.dialogue !== currentDataJson.dialogue &&
		messageJson.dialogue.length > 0 &&
		messageJson.dialogue[messageJson.dialogue.length - 1].isuser;

	if (llmUpdateNeeded) {
		const llmUpdatePromise = updateDialogueLLM(currentDataJson, messageJson);

		const dataToPut: SessionValue = {
			sessioncode: sessioncode,
			uuid: uuid,
			workspace: workspace,
			dialogue: dialogue,
			quickReplies: quickReplies,
			isReplying: true,
			easyMode: easyMode,
			createdAt: currentDataJson.createdAt,
			updatedAt: new Date(),
			isVMRunning: currentDataJson.isVMRunning,
			clients: currentDataJson.clients,
			language: currentDataJson.language,
			llmContext: llmContext,
			tutorial: {
				...tutorial,
				progress: currentDataJson.tutorial.progress,
			},
			stats: stats,
			screenshot: screenshot,
			clicks: clicks,
		};

		await updateDatabase(code, dataToPut, clients);

		const updatedData = await llmUpdatePromise;

		const latestData = await sessionDB.get(code);
		if (!latestData) {
			return;
		}
		const latestDataJson: SessionValue = JSON.parse(latestData);
		const finalDataToPut: SessionValue = {
			sessioncode: latestDataJson.sessioncode,
			uuid: latestDataJson.uuid,
			workspace: latestDataJson.workspace,
			dialogue: updatedData.dialogue,
			quickReplies: updatedData.quickReplies, // 更新された quickReplies を使用
			isReplying: updatedData.isreplying,
			easyMode: latestDataJson.easyMode,
			createdAt: latestDataJson.createdAt,
			updatedAt: new Date(),
			isVMRunning: latestDataJson.isVMRunning,
			clients: latestDataJson.clients,
			language: latestDataJson.language,
			llmContext: llmContext,
			tutorial: {
				...tutorial,
				progress: updatedData.progress,
			},
			stats: updateStats(
				{
					totalInvokedLLM: latestDataJson.stats.totalInvokedLLM + 1,
				},
				latestDataJson,
			).stats,
			screenshot: latestDataJson.screenshot,
			clicks: latestDataJson.clicks,
		};

		await updateDatabase(code, finalDataToPut, clients);
	} else {
		const dataToPut: SessionValue = {
			sessioncode: sessioncode,
			uuid: uuid,
			workspace: workspace,
			dialogue: dialogue,
			quickReplies: quickReplies,
			isReplying: false,
			easyMode: easyMode,
			createdAt: currentDataJson.createdAt,
			updatedAt: new Date(),
			isVMRunning: currentDataJson.isVMRunning,
			clients: currentDataJson.clients,
			language: currentDataJson.language,
			llmContext: llmContext,
			tutorial: {
				...tutorial,
				progress: messageJson.tutorial.progress,
			},
			stats: messageJson.stats,
			screenshot: screenshot,
			clicks: clicks,
		};

		await updateDatabase(code, dataToPut, clients);
	}
}
