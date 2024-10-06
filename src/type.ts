export type ContentType =
	| "user"
	| "ai"
	| "log"
	| "error"
	| "info"
	| "group_log"
	| "ui" // AIによって動的に生成されるUI要素
	| "request";

export type Dialogue = {
	id: number;
	contentType: ContentType;
	isuser: boolean;
	content: string | Dialogue[];
	ui?: string;
};

//タブの種類を定義するための型
export type Tab = "workspaceTab" | "dialogueTab";

//フロントエンドでのチュートリアルの進行度を管理するための型
export type TutorialStats = {
	//チュートリアルの有無
	isTutorial: boolean;
	//チュートリアルのid
	tutorialId: number | null;
	//チュートリアルの進行度
	progress: number;
};

//数値的な統計情報を保存するための型。基本的に全て0からカウントできるnumber型の値を保存する
export type Stats = {
	totalConnectingTime: number;
	currentNumOfBlocks: number;
	totalInvokedLLM: number;
	totalUserMessages: number;
	totalCodeExecutions: number;
};
export type Click = {
	x: number;
	y: number;
	value: number;
	timestamp: number;
};
export type SessionValue = {
	sessioncode: string;
	uuid: string;
	createdAt: Date;
	updatedAt: Date;
	dialogue: Dialogue[];
	quickReplies: string[];
	isReplying: boolean;
	//シリアル化したBlockly.Workspaceを保存する
	workspace: { [key: string]: string };
	isVMRunning: boolean;
	clients: string[];
	language: string;
	//簡単モードかどうかを保存し、簡単モードの場合はAIの返答を簡略化したり、ルビを振ったりする
	easyMode: boolean;
	//AIへ与えるコンテキスト
	llmContext: string;
	//チュートリアルの有無や設定を保存する
	tutorial: TutorialStats;
	//数値的な統計情報を保存する
	stats: Stats;
	//ページの最新のbase64スクリーンショットを保存する
	screenshot: string;
	//直近のユーザーのクリック位置を配列で保存する
	clicks: Click[];
};

//ハイライトするブロック
import type Blockly from "blockly";
export type HighlightedBlock = {
	blockId: string;
	workspace: Blockly.WorkspaceSvg | null;
} | null;

export type WSMinecraftMessage = {
	Header: null;
	Body: null;
};

export type AppConfig = {
	General_Settings: {
		Enable_Join_by_code: boolean;
		Enable_Create_Room: boolean;
		Enable_Memory_Use_Log: boolean;
	};
	AI_Settings: {
		Chat_AI_Model: string;
		Chat_AI_Temperature: number;
	};
	Client_Settings: {
		AutoReply: boolean;
		Reply_Time_ms: number;
		Screenshot_Interval_min: number;
	};
	Code_Execution_Limits: {
		Max_CodeRangeSizeMb: number;
		Max_OldGenerationSizeMb: number;
		Max_YoungGenerationSizeMb: number;
		Max_Num_Message_Queue: number;
	};
	Client_Sentry_Settings: {
		Sentry_DSN: string;
		replaysOnErrorSampleRate: number;
		replaysSessionSampleRate: number;
		tracesSampleRate: number;
	};
};
