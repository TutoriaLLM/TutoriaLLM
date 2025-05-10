import type { TFunction } from "i18next";
import { Bot, Headphones } from "lucide-react";
function renderAIaudioBubble(content: string, t: TFunction, id: number) {
	const parsedContent = JSON.parse(content) as {
		url: string;
		transcript: string;
	};

	const audioUrl = `${import.meta.env.VITE_BACKEND_URL}/audio/${parsedContent.url}`;

	return (
		<div
			key={id}
			className="flex justify-start items-end gap-2 animate-fade-in"
		>
			<div className="text-foreground flex flex-col items-center">
				<span className="p-2">
					<Bot />
				</span>
				<p className="text-xs">{t("textbubble.ai")}</p>
			</div>
			<div className="rounded-2xl rounded-bl-none bg-gradient-to-r from-sky-200 to-rose-200 p-3 border shadow max-w-sm flex flex-col gap-3">
				<span className="flex w-full gap-2 justify-between items-center">
					<Headphones className="w-6 h-6" />
					{t("textbubble.audioMode")}
				</span>

				<p className="text-foreground italic prose prose-sm md:prose-base shadow p-2 rounded-2xl bg-sky-200/40 backdrop-blur">
					{parsedContent.transcript}
				</p>
				<audio controls={true} className="w-full">
					<source src={audioUrl} type="audio/mp3" />
					<track kind="captions" />
				</audio>
			</div>
		</div>
	);
}

export { renderAIaudioBubble };
