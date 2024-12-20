import type { AIAudios } from "@/type.js";
import type { TFunction } from "i18next";
import { Bot, Headphones } from "lucide-react";
function renderAIaudioBubble(
	content: string,
	t: TFunction,
	id: number,
	audios: AIAudios | undefined, // audiosを追加
) {
	console.log("Content:", content);
	console.log("Audios:", audios);

	const parsedContent = JSON.parse(content) as {
		id: string;
		transcript: string;
	};

	console.log("Parsed Content:", parsedContent);

	const audio = audios?.find((audio) => audio?.id === parsedContent.id);

	console.log("Found Audio:", audio);

	return (
		<div
			key={id}
			className="flex justify-start items-end gap-2 animate-fade-in"
		>
			<div className="text-gray-600 flex flex-col items-center">
				<span className="bg-gray-200 rounded-full p-2">
					<Bot />
				</span>
				<p className="text-xs">{t("textbubble.ai")}</p>
			</div>
			<div className="rounded-2xl rounded-bl-none bg-gradient-to-r from-sky-200 to-rose-200 p-3 shadow max-w-sm flex flex-col gap-3">
				<span className="flex w-full gap-2 justify-between items-center">
					<Headphones className="w-6 h-6" />
					{t("textbubble.audioMode")}
				</span>

				<p className="text-gray-600 italic prose prose-sm md:prose-base shadow p-2 rounded-2xl bg-sky-200/40 backdrop-blur">
					{parsedContent.transcript}
				</p>
				<audio controls className="w-full">
					<source
						src={`data:audio/mp3;base64,${audio?.base64}`}
						type="audio/mp3"
					/>
					<track kind="captions" />
				</audio>
			</div>
		</div>
	);
}

export { renderAIaudioBubble };
