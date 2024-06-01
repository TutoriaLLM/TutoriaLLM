export type SessionValue = {
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  //BlocklyのワークスペースはJSONで保存できる（シリアル化を参照）
  workspace: Object;
};
