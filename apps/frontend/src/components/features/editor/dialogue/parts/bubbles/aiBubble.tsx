import type { TFunction } from "i18next";
import { Bot } from "lucide-react";
import Markdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";

// Function to remove ruby tags
function removeRubyTags(content: string): string {
	return content.replace(/<ruby>(.*?)<rt>.*?<\/rt><\/ruby>/g, "$1");
}

function renderAIBubble(
	content: string,
	markdownComponents: Components,
	t: TFunction,
	id: number,
	easymode: boolean, // Add state
) {
	// If state is false, ruby tags are removed
	const displayContent = easymode ? content : removeRubyTags(content);

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
			<div className="rounded-2xl rounded-bl-none bg-sky-100 text-foreground border p-3 shadow max-w-sm">
				<span className="prose prose-sm md:prose-base">
					{/* Add rehypeRaw to allow HTML */}
					<Markdown components={markdownComponents} rehypePlugins={[rehypeRaw]}>
						{displayContent}
					</Markdown>
				</span>
			</div>
		</div>
	);
}

export { renderAIBubble };
