import type { Node } from "@xyflow/react";
import type { SessionValue } from "../../../../type.js";

export type markdownNode = Node<{
	editorContent: string;
	source: string;
}>;

export type metadataNode = Node<{
	title: string;
	description: string;
	keywords: string;
}>;

export type workspaceNode = Node<{
	sessionValue: SessionValue;
}>;

export type MyNode = markdownNode | metadataNode | workspaceNode;

export function isTextNode(node: any): node is markdownNode | metadataNode {
	return node.type === "markdown" || node.type === "metadata";
}
