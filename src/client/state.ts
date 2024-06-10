import { atom } from "jotai";
// 状態管理
//セッションコード
export const userSessionCode = atom("");
//セッションを作成、参加するためのポップアップの表示
export const isPopupOpen = atom(false);
//ワークスペースが接続されているかどうか
export const isWorkspaceConnected = atom(false);
//現在のセッション/比較に使用する１つ前のセッションの状態
import { SessionValue } from "../server/type";
export const currentSessionState = atom<SessionValue | null>(null);
export const prevSessionState = atom<SessionValue | null>(null);

//WSインスタンス
export const websocketInstance = atom<WebSocket | null>(null);

//ワークスペースのコードが実行されているかどうか
export const isWorkspaceCodeRunning = atom(false);
