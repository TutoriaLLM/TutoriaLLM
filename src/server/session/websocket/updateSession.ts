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
		dialogue,
		stats,
		language,
	} = messageJson;

	const code = sessioncode;

	async function updateDialogueLLM(
		oldData: SessionValue,
		newData: SessionValue,
	): Promise<{
		dialogue: Dialogue[];
		isreplying: boolean;
		progress: number;
	}> {
		//最後のメッセージをとりだす
		const lastMessage = newData.dialogue[newData.dialogue.length - 1];
		//最後のメッセージがユーザーからのメッセージであるかを確認
		if (
			newData.dialogue !== oldData.dialogue &&
			newData.dialogue.length > 0 &&
			lastMessage.isuser
		) {
			const blockFiles = await getBlockFiles();
			const availableBlocks = await getAvailableBlocks(blockFiles, language);
			const extreactedBlockNames = availableBlocks.map(
				(block) => block.block.type,
			);

			const message = await invokeLLM(messageJson, extreactedBlockNames);

			if (message.blockId && message.blockName) {
				console.log(message);
				const response = message.response;
				const newDialogueWithResponse = updateDialogue(
					response,
					messageJson,
					"ai",
				);
				const blockId = message.blockId;
				const newDialogueWithBlockId = updateDialogue(
					blockId,
					newDialogueWithResponse,
					"blockId",
				);
				const blockName = message.blockName;
				const newDialogueWithBlockName = updateDialogue(
					blockName,
					newDialogueWithBlockId,
					"blockName",
				);
				return {
					dialogue: newDialogueWithBlockName.dialogue,
					isreplying: false,
					progress: message.progress,
				};
			}
			if (message.blockId) {
				console.log(message);
				const response = message.response;
				const newDialogueWithResponse = updateDialogue(
					response,
					messageJson,
					"ai",
				);
				const blockId = message.blockId;
				const newDialogueWithBlockId = updateDialogue(
					blockId,
					newDialogueWithResponse,
					"blockId",
				);
				return {
					dialogue: newDialogueWithBlockId.dialogue,
					isreplying: false,
					progress: message.progress,
				};
			}
			if (message.blockName) {
				console.log(message);
				const response = message.response;
				const newDialogueWithResponse = updateDialogue(
					response,
					messageJson,
					"ai",
				);
				const blockName = message.blockName;
				const newDialogueWithBlockName = updateDialogue(
					blockName,
					newDialogueWithResponse,
					"blockName",
				);
				return {
					dialogue: newDialogueWithBlockName.dialogue,
					isreplying: false,
					progress: message.progress,
				};
			}

			if (message) {
				const newDialogue = updateDialogue(message.response, messageJson, "ai");
				return {
					dialogue: newDialogue.dialogue,
					isreplying: false,
					progress: message.progress,
				};
			}
		}
		return {
			dialogue: newData.dialogue,
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
			isReplying: true,
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
			isReplying: updatedData.isreplying,
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
		};

		await updateDatabase(code, finalDataToPut, clients);
	} else {
		const dataToPut: SessionValue = {
			sessioncode: sessioncode,
			uuid: uuid,
			workspace: workspace,
			dialogue: dialogue,
			isReplying: false,
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
		};

		await updateDatabase(code, dataToPut, clients);
	}
}
