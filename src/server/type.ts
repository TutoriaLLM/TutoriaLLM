export type Dialogue = {
  contentType: string;
  isuser: boolean;
  //コンテンツの種類が決まったら型を追加する
  content: any;
}[];

export type WSrequestMessage = {
  request: string;
  value?: string;
};

export type SessionValue = {
  sessioncode: string;
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  dialogue: Dialogue;
  workspace: Object;
};

export type WSMinecraftMessage = {
  Header: {};
  Body: {};
};
