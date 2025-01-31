import type { AppConfig } from "@/type";
import { i18nParser } from "@/utils/i18nParser.js";
import type { TFunction } from "i18next";
import { CircleCheck, Info, Server, TriangleAlert } from "lucide-react";
import Markdown, { type Components } from "react-markdown";

function renderGroupLogBubble(
	content: Array<any>,
	markdownComponents: Components,
	t: TFunction,
	setting: AppConfig | undefined,
	id: number,
) {
	return (
		<div
			key={id}
			className="flex justify-start items-end gap-2 w-full break-all animate-fade-in"
		>
			<div className="text-foreground flex flex-col items-center shrink">
				<span className="p-2">
					<Server />
				</span>
				<p className="text-xs">{t("textbubble.server")}</p>
			</div>
			<div className="rounded-2xl text-background bg-foreground border p-3 gap-3 flex flex-col shadow max-w-sm w-full grow">
				{content.some((logItem) => logItem.contentType === "error") ? (
					<span className="text-xs w-full font-semibold text-warining-foreground rounded-2xl flex justify-between items-center p-2 bg-warning">
						<span className="text-xs text-warining-foreground">
							<p className="text-base flex-grow">{t("textbubble.errorLog")}</p>
							{t("textbubble.showingLatest", {
								count: setting?.Code_Execution_Limits?.Max_Num_Message_Queue,
							})}
						</span>
						<TriangleAlert />
					</span>
				) : (
					<span className="text-xs w-full font-semibold text-secondary-foreground rounded-2xl flex justify-between items-center p-2 bg-secondary">
						<span className="text-xs text-secondary-foreground">
							<p className="text-base flex-grow">{t("textbubble.log")}</p>
							{t("textbubble.showingLatest", {
								count: setting?.Code_Execution_Limits?.Max_Num_Message_Queue,
							})}
						</span>
						<CircleCheck />
					</span>
				)}
				<div className="prose-invert flex flex-col w-full gap-2">
					{content.map((logItem) => (
						<span
							className={`text-sm font-mono break-words ${
								logItem.contentType === "error"
									? "text-warning-foreground pl-2 border-l-2 border-warning"
									: logItem.contentType === "info"
										? "text-primary-foreground pl-2 border-l-2 border-primary"
										: ""
							}`}
							key={logItem.id}
						>
							{logItem.contentType === "error" ? (
								<TriangleAlert />
							) : logItem.contentType === "info" ? (
								<Info />
							) : (
								""
							)}
							<Markdown components={markdownComponents}>
								{i18nParser(logItem.content)}
							</Markdown>
						</span>
					))}
				</div>
			</div>
		</div>
	);
}

export { renderGroupLogBubble };
