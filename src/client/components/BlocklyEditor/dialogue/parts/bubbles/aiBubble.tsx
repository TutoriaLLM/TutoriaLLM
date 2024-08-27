import type { TFunction } from "i18next";
import { Bot } from "lucide-react";
import Markdown, { type Components } from "react-markdown";

function renderAIBubble(
	content: string,
	markdownComponents: Components,
	t: TFunction,
	id: number,
) {
	return (
		<div key={id} className="flex justify-start items-end gap-2">
			<div className="text-gray-600 flex flex-col items-center">
				<span className="bg-gray-200 rounded-full p-2">
					<Bot />
				</span>
				<p className="text-xs">{t("textbubble.ai")}</p>
			</div>
			<div className="rounded-2xl rounded-bl-none bg-sky-200 text-white p-3 shadow max-w-sm">
				<p className="prose">
					<Markdown components={markdownComponents}>{content}</Markdown>
				</p>
			</div>
		</div>
	);
}

export { renderAIBubble };
