import { langToStr } from "@/utils/langToStr";
import i18next from "i18next";
import { Globe } from "lucide-react";

// ユーザーはドロップダウンから言語を選択する。
export function LangPicker(props: {
	language: string;
	setLanguage: (lang: string) => void;
}) {
	const languageList = i18next.languages.slice().sort(); // ここでABC順にソートする

	return (
		<div className="flex justify-center items-center gap-2 p-2 rounded-2xl w-full">
			<Globe className="w-6 h-6" />
			<select
				className="p-2 rounded-xl bg-gray-200 hover:bg-gray-300"
				value={props.language}
				onChange={(e) => props.setLanguage(e.target.value)}
			>
				{languageList.map((lang, index) => (
					<option key={index} value={lang}>
						{langToStr(lang)}
					</option>
				))}
			</select>
		</div>
	);
}
