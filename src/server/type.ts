type ContentType = "user" | "ai" | "log" | "image";

export type Dialogue = {
  contentType: ContentType;
  isuser: boolean;
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
  workspace: Object;
  isVMRunning: boolean;
  clients: string[];
};

export type WSMinecraftMessage = {
  Header: {};
  Body: {};
};
