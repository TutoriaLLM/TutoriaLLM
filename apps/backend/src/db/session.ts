import type { AppSession } from "@/db/schema"; // Type used when interacting with DB (almost the same as SessionValue used in the front end)

export function initialData(
	uuid: string,
	sessionId: string,
	language: string,
	userId: string,
): AppSession {
	const quickReplyByLang = [
		"quickReply.WhatINeed",
		"quickReply.HowToUse",
		"quickReply.BeginTutorial",
	];
	return {
		uuid: uuid,
		sessionId: sessionId,
		name: null,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		dialogue: [
			{
				id: 0,
				contentType: "log",
				isuser: false,
				content: "dialogue.Introduction",
			},
		],
		quickReplies: quickReplyByLang,
		isReplying: false,
		easyMode: false,
		responseMode: "text",
		workspace: {},
		isVMRunning: false,
		clients: [],
		language: language,
		llmContext: "",
		tutorial: {
			isTutorial: false,
			tutorialId: null,
			progress: 10,
		},
		stats: {
			totalConnectingTime: 0,
			currentNumOfBlocks: 0,
			totalInvokedLLM: 0,
			totalUserMessages: 0,
			totalCodeExecutions: 0,
		},
		audios: [],
		userAudio: "",
		screenshot: "",
		clicks: [],
		userInfo: userId,
	};
}
