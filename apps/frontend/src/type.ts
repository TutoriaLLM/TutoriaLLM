import { adminClient, client } from "@/api";
import type { InferResponseType } from "backend/hc";
import { authClient } from "./libs/auth-client";

//auth
const AuthSession = authClient.$Infer.Session;
export type AuthSession = typeof AuthSession;

//from backend/hc and api
const $Config = client.config.$get;
export type AppConfig = InferResponseType<typeof $Config>;

const $Session = client.session[":key"].$get;
export type SessionValue = InferResponseType<typeof $Session, 200>;

const $AdminSessionList = adminClient.admin.session.list.$get;

type AdminSessionList = InferResponseType<typeof $AdminSessionList, 200>;
export type AdminSingleSession = AdminSessionList["sessions"][0];

const $Tutorial = client.tutorials[":id"].$get;
export type Tutorial = InferResponseType<typeof $Tutorial, 200>;

export type Clicks = SessionValue["clicks"];
export type AIAudios = SessionValue["audios"];
export type Stats = SessionValue["stats"];

// Type for defining tab types
export type Tab = "workspaceTab" | "dialogueTab";
