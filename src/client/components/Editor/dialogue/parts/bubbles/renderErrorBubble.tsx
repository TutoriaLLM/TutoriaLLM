import type { TFunction } from "i18next";
import { Server } from "lucide-react";
import Markdown, { type Components } from "react-markdown";

function renderErrorBubble(
	content: string,
	markdownComponents: Components,
	t: TFunction,
	id: number,
) {
	return (
		<div
			key={id}
			className="flex justify-start items-end gap-2 animate-fade-in"
		>
			<div className="text-gray-600 flex flex-col items-center">
				<span className="bg-gray-200 rounded-full p-2">
					<Server />
				</span>
				<p className="text-xs">{t("textbubble.server")}</p>
			</div>
			<div className="text-red-800 bg-red-200 rounded-2xl p-3 max-w-sm w-full">
				<p className="text-xs font-semibold text-red-600">
					{t("error.error")}:
				</p>
				<span className="prose prose-sm md:prose-base text-red-800">
					<Markdown components={markdownComponents}>{content}</Markdown>
				</span>
			</div>
		</div>
	);
}

export { renderErrorBubble };
