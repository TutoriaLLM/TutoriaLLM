import { Workspace } from "blockly";

export interface DatabaseUser {
  id: string;
  username: string;
  password: string;
}

export type WSMessage = {
  request: string;
  value?: string | number | boolean | object | null;
};

export type ContentType = "user" | "ai" | "log" | "image";

export type Dialogue = {
  contentType: ContentType;
  isuser: boolean;
  content: any; // コンテンツの種類に応じて型を変更できます
};

//バックエンドでのチュートリアルの内容を管理するための型
export type TutorialData = {
  //チュートリアルのid
  id: string;
  //チュートリアルの内容
  content: string;
  //チュートリアルのメタデータ(未定義のためany型)
  metadata: {
    marp: true;
    title: string;
    description: string;
    author?: string;
    keywords?: string[];
  };
};

//フロントエンドでのチュートリアルの進行度を管理するための型
export type Tutorial = {
  //チュートリアルの有無
  isTutorial: boolean;
  //チュートリアルのid
  tutorialId: string | null;
  //チュートリアルの進行度
  progress: number | null;
};

export type SessionValue = {
  sessioncode: string;
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  dialogue: Dialogue[];
  //シリアル化したBlockly.Workspaceを保存する
  workspace: any[string];
  isVMRunning: boolean;
  clients: string[];
  language: string;
  //AIへ与えるコンテキスト
  llmContext: string;
  //チュートリアルの有無や設定を保存する
  tutorial: Tutorial;
};

export type WSMinecraftMessage = {
  Header: {};
  Body: {};
};

export type AppConfig = {
  General_Settings: {
    Enable_Join_by_code: boolean;
    Enable_Create_Room: boolean;
  };
  AI_Settings: {
    AI_Model: string;
    AI_Temperature: number;
    Max_Number_of_processes: number;
  };
};
