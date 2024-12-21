import * as Blockly from "blockly/core";

const Theme = Blockly.Theme.defineTheme("theme", {
	name: "theme",
	base: Blockly.Themes.Classic,
	componentStyles: {
		//WARN: changing BackgroundColor may affects blockHighlight plugin.
		workspaceBackgroundColour: "#f3f4f6",
		toolboxBackgroundColour: "#e5e7eb",
		toolboxForegroundColour: "#374151",
		flyoutBackgroundColour: "#f3f4f6",
		flyoutForegroundColour: "#ccc",
		flyoutOpacity: 1,
		scrollbarColour: "#797979",
		insertionMarkerColour: "#fff",
		insertionMarkerOpacity: 0.3,
		scrollbarOpacity: 0.3,
		cursorColour: "#67e8f9",
	},
	//follow tailwind css color. primary:500 secondary:400 tertiary:300
	blockStyles: {
		logic_blocks: {
			colourPrimary: "#06b6d4",
			colourSecondary: "#22d3ee",
			colourTertiary: "#67e8f9",
		},
		math_blocks: {
			colourPrimary: "#3b82f6",
			colourSecondary: "#60a5fa",
			colourTertiary: "#93c5fd",
		},
		loop_blocks: {
			colourPrimary: "#10b981",
			colourSecondary: "#34d399",
			colourTertiary: "#6ee7b7",
		},
		variable_blocks: {
			colourPrimary: "#ef4444",
			colourSecondary: "#f87171",
			colourTertiary: "#fca5a5",
		},
		text_blocks: {
			colourPrimary: "#f97316",
			colourSecondary: "#fb923c",
			colourTertiary: "#fdba74",
		},
		// Function Blocks.
		procedure_blocks: {
			colourPrimary: "#6366f1",
			colourSecondary: "#818cf8",
			colourTertiary: "#a5b4fc",
		},
		list_blocks: {
			colourPrimary: "#737373",
			colourSecondary: "#a3a3a3",
			colourTertiary: "#d4d4d4",
		},
	},
});

Blockly.Scrollbar.scrollbarThickness = 15;

export default Theme;
