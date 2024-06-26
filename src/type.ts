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
}[];

export type SessionValue = {
  sessioncode: string;
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  dialogue: Dialogue;
  //シリアル化したBlockly.Workspaceを保存する
  workspace: any[string];
  isVMRunning: boolean;
  clients: string[];
  language: string;
  //AIへ与えるコンテキスト
  llmContext: string;
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
