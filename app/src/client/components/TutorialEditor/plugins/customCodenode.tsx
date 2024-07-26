import { CodeNode, $createCodeNode } from "@lexical/code";
import type { EditorConfig } from "lexical";
import { createRoot } from "react-dom/client";
import React from "react";

export class CustomCodeNode extends CodeNode {
	static getType() {
		return "custom-code";
	}

	static clone(node: CustomCodeNode) {
		return new CustomCodeNode(node.__language, node.__key);
	}

	createDOM(config: EditorConfig) {
		// Create a new div container
		const container = document.createElement("div");
		container.className =
			"w-full bg-gray-800 text-white text-sm space-x-4 font-mono font-light rounded-lg p-4 pl-6";

		// Create a label element
		const label = document.createElement("div");
		label.className =
			"text-xs font-bold mb-2 bg-gray-700 text-gray-300 p-1 rounded";
		label.textContent = "Blockly Code:";

		// Append the label to the container
		container.appendChild(label);

		// Create a content container for the code
		const contentContainer = document.createElement("div");
		contentContainer.className = "code-content";

		// Append the content container to the main container
		container.appendChild(contentContainer);

		return container;
	}

	updateDOM(prevNode: CustomCodeNode, dom: HTMLElement) {
		console.log("Updating DOM for CustomCodeNode");
		// DOMの更新は必要ありません
		return false;
	}
}

// Extend the Lexical Editor to register the custom node
export function CustomCodeNodePlugin() {
	return {
		nodes: [CustomCodeNode],
	};
}
