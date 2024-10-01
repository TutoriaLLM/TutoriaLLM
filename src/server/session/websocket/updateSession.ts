import type { Socket } from "socket.io";
import type { Dialogue, SessionValue } from "../../../type.js";
import { updateDialogue } from "../../../utils/dialogueUpdater.js";
import { updateStats } from "../../../utils/statsUpdater.js";
import { sessionDB } from "../../db/session.js";
import { invokeLLM } from "../llm/index.js";
import { getAvailableBlocks, getBlockFiles } from "../registerBlocks.js";
import { broadcastDiff, broadcastDiffToAll } from "./updateDB.js";

export async function updateSession(
	currentDataJson: SessionValue,
	newDataJson: SessionValue,
	socket: Socket,
) {
	console.log("updateSession");
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
	} = newDataJson;

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
		console.log("updateDialogueLLM");
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

			const message = await invokeLLM(newDataJson, extractedBlockNames);

			if (message) {
				console.log(message);
				let updatedDialogue = updateDialogue(
					message.response,
					newDataJson,
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
		newDataJson.dialogue !== currentDataJson.dialogue &&
		newDataJson.dialogue.length > 0 &&
		newDataJson.dialogue[newDataJson.dialogue.length - 1].isuser;

	console.log(
		"isdialoguedifferent",
		newDataJson.dialogue !== currentDataJson.dialogue,
	);
	console.log("dialoguelength", newDataJson.dialogue.length > 0);
	console.log(
		"islastmessageuser",
		newDataJson.dialogue[newDataJson.dialogue.length - 1].isuser,
	);

	if (llmUpdateNeeded) {
		const llmUpdatePromise = updateDialogueLLM(currentDataJson, newDataJson);

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

		await broadcastDiff(code, dataToPut, socket);

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

		await broadcastDiffToAll(code, finalDataToPut, socket);
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
				progress: newDataJson.tutorial.progress,
			},
			stats: newDataJson.stats,
			screenshot: screenshot,
			clicks: clicks,
		};

		await broadcastDiff(code, dataToPut, socket);
	}
}
