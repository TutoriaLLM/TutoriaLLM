import type { TFunction } from "i18next";
import { Bot } from "lucide-react";
import Markdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";

// ルビタグを削除する関数
function removeRubyTags(content: string): string {
	return content.replace(/<ruby>(.*?)<rt>.*?<\/rt><\/ruby>/g, "$1");
}

function renderAIBubble(
	content: string,
	markdownComponents: Components,
	t: TFunction,
	id: number,
	state: boolean, // stateを追加
) {
	// stateがfalseの場合、ルビタグを削除
	const displayContent = state ? content : removeRubyTags(content);

	return (
		<div key={id} className="flex justify-start items-end gap-2">
			<div className="text-gray-600 flex flex-col items-center">
				<span className="bg-gray-200 rounded-full p-2">
					<Bot />
				</span>
				<p className="text-xs">{t("textbubble.ai")}</p>
			</div>
			<div className="rounded-2xl rounded-bl-none bg-sky-200 text-white p-3 shadow max-w-sm">
				<span className="prose">
					{/* rehypeRawを追加してHTMLを許可 */}
					<Markdown components={markdownComponents} rehypePlugins={[rehypeRaw]}>
						{displayContent}
					</Markdown>
				</span>
			</div>
		</div>
	);
}

export { renderAIBubble };
