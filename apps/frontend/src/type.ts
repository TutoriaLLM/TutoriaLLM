import type { InferRequestType, InferResponseType } from "backend/hc";
import { client } from "@/api";

const $Config = client.config.$get;
export type AppConfig = InferResponseType<typeof $Config>;

const $Session = client.session[":key"].$get;
export type SessionValue = InferResponseType<typeof $Session, 200>;

const $SessionPost = client.session.resume.$post;
type SessionPost = InferRequestType<typeof $SessionPost>;

const $Tutorial = client.tutorials[":id"].$get;
export type Tutorial = InferResponseType<typeof $Tutorial, 200>;

export type SessionValuePost = SessionPost["json"];
export type Clicks = SessionValue["clicks"];
export type AIAudios = SessionValue["audios"];
export type Stats = SessionValue["stats"];

//ハイライトするブロック
import type Blockly from "blockly";
export type HighlightedBlock = {
	blockId: string;
	workspace: Blockly.WorkspaceSvg | null;
} | null;

//タブの種類を定義するための型
export type Tab = "workspaceTab" | "dialogueTab";
