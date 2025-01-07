import type { TFunction } from "i18next";
import { Headphones, User } from "lucide-react";

function renderUserAudioBubble(content: string, t: TFunction, id: number) {
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
				{content === "" ? (
					<p className="flex justify-center items-center gap-2 bg-gradient-to-r from-gray-500 from-30% via-gray-700 via-50% to-gray-500 to-70% bg-[size:280%] bg-center animate-loading-flow text-transparent bg-clip-text">
						<Headphones className="text-gray-400" />
						{t("textbubble.transcribing")}
					</p>
				) : (
					<p className="flex prose prose-sm md:prose-base justify-center items-center gap-2">
						{content}
					</p>
				)}
			</div>
		</div>
	);
}

export { renderUserAudioBubble };
