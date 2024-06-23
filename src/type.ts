export interface DatabaseUser {
  id: string;
  username: string;
  password: string;
}

type ContentType = "user" | "ai" | "log" | "image";

export type Dialogue = {
  contentType: ContentType;
  isuser: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  content: any; // コンテンツの種類に応じて型を変更できます
}[];

export type WSMessage = {
  request: string;
  value?: string | number | boolean | object | null;
};

export type SessionValue = {
  sessioncode: string;
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  dialogue: Dialogue;
  //シリアル化したBlockly.Workspaceを保存する
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  workspace: any[string];
  isVMRunning: boolean;
  clients: string[];
  language: string;
};

export type WSMinecraftMessage = {
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  Header: {};
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  Body: {};
};

export type AppConfig = {
  settings: {
    defaultPassword: string;
    enableJoinbyCode: boolean;
    enableCreateRoom: boolean;
  };
};
