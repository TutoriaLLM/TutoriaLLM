import { atom } from "jotai";

// state management
// State of the language to start, obtained from i18n. SessionState is used after the session has started.
export const LanguageToStart = atom("");
// Whether the workspace is connected
export const isWorkspaceConnected = atom(false);
// Current session/state of one previous session used for comparison
export const currentSessionState = atom<SessionValue | null>(null);
export const prevSessionState = atom<SessionValue | null>(null);

// Current tab state
export const currentTabState = atom<Tab>("workspaceTab");

// State of the block to highlight
export const highlightedBlockState = atom<HighlightedBlock>(null);

// State of the block to be retrieved from the menu
export const blockNameFromMenuState = atom<string | null>(null);

import type { HighlightedBlock, SessionValue, Tab } from "@/type";
// WS Instance
import type { Socket } from "socket.io-client";
export const socketIoInstance = atom<Socket | null>(null);
