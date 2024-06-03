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
  categoryStyles: {
    logic_category: {
      colour: "#16a34a",
    },
  },
  blockStyles: {
    logic_blocks: {
      colourPrimary: "#10b981",
      colourSecondary: "#10b981",
      colourTertiary: "#10b981",
    },
  },
});

Blockly.Scrollbar.scrollbarThickness = 15;

export default Theme;
