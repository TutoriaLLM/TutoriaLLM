import * as Blockly from "blockly/core";

const Theme = Blockly.Theme.defineTheme("theme", {
	name: "theme",
	base: Blockly.Themes.Classic,
	componentStyles: {
		workspaceBackgroundColour: "#f3f4f6",
		toolboxBackgroundColour: "#e5e7eb",
		toolboxForegroundColour: "#374151",
		flyoutBackgroundColour: "#e5e7eb",
		flyoutForegroundColour: "#ccc",
		flyoutOpacity: 0.4,
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
	},
});

Blockly.Scrollbar.scrollbarThickness = 15;

export default Theme;
