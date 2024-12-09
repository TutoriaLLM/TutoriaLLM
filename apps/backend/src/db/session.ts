import type { AppSession } from "@/db/schema"; //DBとやりとりする際に使う型（フロントエンドで利用しているSessionValueとほぼ同じ）

export function initialData(code: string, language: string): AppSession {
	const quickReplyByLang = [
		"quickReply.WhatINeed",
		"quickReply.HowToUse",
		"quickReply.BeginTutorial",
	];
	return {
		sessioncode: code,
		uuid: crypto.randomUUID(),
		createdAt: new Date(),
		updatedAt: new Date(),
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
	};
}
