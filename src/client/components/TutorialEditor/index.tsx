import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

//内容を保存するstate
import type { EditorState } from "lexical";
import React, { useState, useEffect } from "react";

//nodesの追加
import { HeadingNode } from "@lexical/rich-text";
import type { Klass, LexicalNode } from "lexical";
const nodes: Array<Klass<LexicalNode>> = [HeadingNode];

//Markdownの入力サポート
import type { Transformer } from "@lexical/markdown";
import { HEADING } from "@lexical/markdown";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";

//markdownを変換する関数
import {
	$convertFromMarkdownString,
	$convertToMarkdownString,
} from "@lexical/markdown";

import ToolbarPlugin from "./toolbar.js";
const placeholder = "Enter some rich text...";

function MarkdownConversionPlugin(props: {
	setMarkdownState: (markdown: string) => void;
}) {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				const markdown = $convertToMarkdownString([HEADING]);
				props.setMarkdownState(markdown);
			});
		});
	}, [editor, props.setMarkdownState]);

	return null;
}

export default function SlideEditor() {
	const TRANSFORMERS: Array<Transformer> = [HEADING];

	const [editorState, setEditorState] = useState<EditorState | null>(null);
	const [markdownState, setMarkdownState] = useState<string>("");

	const editorConfig = {
		namespace: "tutorial-editor",
		nodes: nodes,
		// Handling of errors during update
		onError(error: Error) {
			throw error;
		},
		// The editor theme
		theme: {
			heading: {
				h1: "text-3xl font-bold",
				h2: "text-2xl font-bold",
				h3: "text-1xl font-bold",
				paragraph: "text-base",
			},
		},
		editorState: editorState,
	};

	return (
		<div className="w-full h-full flex flex-col">
			<h3 className="text-xl">Editor</h3>
			<div className="w-full h-full">
				<LexicalComposer initialConfig={editorConfig}>
					<div className="w-full h-full">
						<ToolbarPlugin />
						<div className="bg-white">
							<RichTextPlugin
								contentEditable={
									<ContentEditable
										className="editor-input"
										aria-placeholder={placeholder}
										placeholder={`<div className="editor-placeholder">${placeholder}</div>`}
									/>
								}
								ErrorBoundary={LexicalErrorBoundary}
								placeholder={null}
							/>
							<HistoryPlugin />
						</div>
					</div>
					<OnChangePlugin
						onChange={(editorState: EditorState) => {
							console.log(editorState);
							setEditorState(editorState);
						}}
					/>
					<MarkdownShortcutPlugin transformers={TRANSFORMERS} />
					<MarkdownConversionPlugin setMarkdownState={setMarkdownState} />
				</LexicalComposer>
			</div>
			<h3 className="text-xl">Markdown Preview</h3>
			<code className="text-xs">{markdownState}</code>
		</div>
	);
}
