import type { SessionValue } from "@/type";
import type { Node } from "@xyflow/react";

export type markdownNode = Node<{
	editorContent: string;
	source: string;
}>;

export type mdToMdNode = Node<{
	source: string;
	outputFromAI: string;
}>;

export type outputNode = Node<{
	output: string;
}>;

export type metadataNode = Node<{
	title: string;
	description: string;
	tags: string[];
	language: string;
}>;

export type mdToMetadataNode = Node<{
	source: string;
	metaData: {
		title: string;
		description: string;
		tags: string[];
		language: string;
	};
}>;

export type workspaceNode = Node<{
	sessionValue: SessionValue;
}>;

export type MyNode = markdownNode | metadataNode | workspaceNode;

export function isTextNode(node: any): node is markdownNode | metadataNode {
	return node.type === "markdown" || node.type === "metadata";
}
