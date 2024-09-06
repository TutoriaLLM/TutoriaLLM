import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import type { EditorState } from "lexical";
import { useState, useEffect } from "react";
import { HeadingNode } from "@lexical/rich-text";
import { $createCodeNode, CodeNode } from "@lexical/code";
import { $createParagraphNode, ParagraphNode } from "lexical"; // 追加
import type { Transformer } from "@lexical/markdown";
import { HEADING, CODE } from "@lexical/markdown";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import {
	$convertFromMarkdownString,
	$convertToMarkdownString,
} from "@lexical/markdown";
import ToolbarPlugin from "./toolbar.js";
import { block } from "../../../extensions/Server/blocks/consoleLog.js";
import { CustomCodeNode } from "./plugins/customCodenode.js";

const placeholder = "Enter some rich text...";

function MarkdownConversionPlugin(props: {
	setMarkdownState: (markdown: string) => void;
}) {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				const markdown = $convertToMarkdownString([HEADING, CODE]);
				props.setMarkdownState(markdown);
			});
		});
	}, [editor, props.setMarkdownState]);

	return null;
}

function MarkdownLoader(props: { markdown: string }) {
	const [editor] = useLexicalComposerContext();
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		if (!loaded && props.markdown) {
			editor.update(() => {
				$convertFromMarkdownString(props.markdown, [HEADING, CODE]);
			});
			setLoaded(true);
		}
	}, [editor, props.markdown, loaded]);

	return null;
}

interface SlideEditorProps {
	mdContent: string;
	onContentChange: (content: string) => void;
}

const SlideEditor: React.FC<SlideEditorProps> = ({
	mdContent,
	onContentChange,
}) => {
	const TRANSFORMERS: Array<Transformer> = [HEADING, CODE];

	const [markdownState, setMarkdownState] = useState<string>(mdContent);
	const editorConfig = {
		namespace: "tutorial-editor",
		nodes: [
			HeadingNode,
			ParagraphNode,
			CustomCodeNode,
			{
				replace: CodeNode,
				with: (node: CodeNode) => {
					return new CustomCodeNode();
				},
			},
		], // 追加
		onError(error: Error) {
			throw error;
		},
		theme: {
			heading: {
				h1: "text-3xl font-bold",
				h2: "text-2xl font-bold",
				h3: "text-1xl font-bold",
			},
			paragraph: "text-sm font-normal mt-2",
			code: "w-full rounded-2xl p-2 rounded-lg font-mono text-xs",
		},
	};

	useEffect(() => {
		setMarkdownState(mdContent);
		console.log("mdContent", mdContent);
	}, [mdContent]);

	return (
		<div className="w-full h-full flex flex-col">
			<div className="w-full h-full py-2">
				<LexicalComposer initialConfig={editorConfig}>
					<div className="w-full h-full border rounded-2xl overflow-clip p-2">
						<ToolbarPlugin />
						<div className="bg-white border">
							<RichTextPlugin
								contentEditable={
									<ContentEditable
										className="editor-input min-h-[200px] w-full p-2 md:p-3.5" // ここに最小高さを追加
										aria-placeholder={placeholder}
										placeholder={`<div className="">${placeholder}</div>`}
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
							editorState.read(() => {
								const markdown = $convertToMarkdownString([HEADING, CODE]);
								setMarkdownState(markdown);
								onContentChange(markdown);
							});
						}}
					/>
					<MarkdownShortcutPlugin transformers={TRANSFORMERS} />
					<MarkdownConversionPlugin setMarkdownState={setMarkdownState} />
					<MarkdownLoader markdown={mdContent} />
				</LexicalComposer>
			</div>
		</div>
	);
};

export default SlideEditor;
