import { atom } from "jotai";

// state management
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
