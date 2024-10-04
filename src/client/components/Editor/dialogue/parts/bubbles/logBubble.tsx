import type { TFunction } from "i18next";
import { Server } from "lucide-react";
import Markdown, { type Components } from "react-markdown";

function renderLogBubble(
	content: string,
	markdownComponents: Components,
	t: TFunction,
	id: number,
) {
	return (
		<div key={id} className="flex justify-start items-end gap-2">
			<div className="text-gray-600 flex flex-col items-center">
				<span className="bg-gray-200 rounded-full p-2">
					<Server />
				</span>
				<p className="text-xs">{t("textbubble.server")}</p>
			</div>
			<div className="text-gray-800 bg-transparent rounded-2xl p-3 max-w-sm w-full">
				<p className="text-xs font-semibold text-gray-600">
					{t("textbubble.log")}:
				</p>
				<span className="prose">
					<Markdown components={markdownComponents}>{content}</Markdown>
				</span>
			</div>
		</div>
	);
}

export { renderLogBubble };
