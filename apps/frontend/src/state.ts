import { atom } from "jotai";

// state management
// Current tab state
export const currentTabState = atom<Tab>("workspaceTab");

// State of the block to highlight
export const highlightedBlockState = atom<HighlightedBlock>(null);

// State of the block to be retrieved from the menu
export const blockNameFromMenuState = atom<string | null>(null);

import type { HighlightedBlock, Tab } from "@/type";
