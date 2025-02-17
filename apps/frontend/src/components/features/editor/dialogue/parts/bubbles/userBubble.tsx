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
			className="flex justify-start flex-row-reverse items-end gap-2 animate-fade-in"
		>
			<div className="text-foreground flex flex-col items-center">
				<span className="p-2">
					<User />
				</span>
				<p className="text-xs">{t("textbubble.you")}</p>
			</div>
			<div className="rounded-2xl rounded-br-none bg-accent text-accent-foreground border p-3 shadow max-w-sm">
				<span className="prose prose-sm md:prose-base">
					<Markdown components={markdownComponents}>{content}</Markdown>
				</span>
			</div>
		</div>
	);
}

export { renderUserBubble };
