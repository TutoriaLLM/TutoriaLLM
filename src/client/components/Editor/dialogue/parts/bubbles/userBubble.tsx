import type { TFunction } from "i18next";
import { User } from "lucide-react";
import Markdown, { type Components } from "react-markdown";

function renderUserBubble(
	content: string,
	markdownComponents: Components,
	t: TFunction,
	id: number,
) {
	return (
		<div
			key={id}
			className="flex justify-start flex-row-reverse items-end gap-2"
		>
			<div className="text-gray-600 flex flex-col items-center">
				<span className="bg-gray-200 rounded-full p-2">
					<User />
				</span>
				<p className="text-xs">{t("textbubble.you")}</p>
			</div>
			<div className="rounded-2xl rounded-br-none bg-gray-300 text-gray-800 p-3 shadow max-w-sm">
				<span className="prose">
					<Markdown components={markdownComponents}>{content}</Markdown>
				</span>
			</div>
		</div>
	);
}

export { renderUserBubble };
