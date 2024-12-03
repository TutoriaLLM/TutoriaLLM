import type { InferResponseType } from "backend/hc";
import { adminClient, client } from "./api/index.js";

const $Config = client.config.$get;
export type AppConfig = InferResponseType<typeof $Config>;

const $Session = client.session[":key"].$get;
export type SessionValue = InferResponseType<typeof $Session, 200>;
export type Clicks = SessionValue["clicks"];
export type Stats = SessionValue["stats"];

//ハイライトするブロック
import type Blockly from "blockly";
export type HighlightedBlock = {
	blockId: string;
	workspace: Blockly.WorkspaceSvg | null;
} | null;

//タブの種類を定義するための型
export type Tab = "workspaceTab" | "dialogueTab";
