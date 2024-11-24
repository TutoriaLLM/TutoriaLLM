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

import type { AppSession } from "./src/db/schema.js";
export type SessionValue = AppSession; //

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
