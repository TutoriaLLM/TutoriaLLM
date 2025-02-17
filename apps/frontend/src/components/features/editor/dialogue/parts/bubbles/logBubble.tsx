import { i18nParser } from "@/utils/i18nParser";
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
		<div
			key={id}
			className="flex justify-start items-end gap-2 animate-fade-in"
		>
			<div className="text-foreground flex flex-col items-center">
				<span className="p-2">
					<Server />
				</span>
				<p className="text-xs">{t("textbubble.server")}</p>
			</div>
			<div className="text-foreground bg-transparent rounded-2xl p-3 max-w-sm w-full">
				<p className="text-xs font-semibold text-foreground">
					{t("textbubble.log")}:
				</p>
				<span className="prose prose-sm md:prose-base">
					<Markdown components={markdownComponents}>
						{i18nParser(content)}
					</Markdown>
				</span>
			</div>
		</div>
	);
}

export { renderLogBubble };
