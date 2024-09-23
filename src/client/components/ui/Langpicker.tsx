import i18next from "i18next";
import { Globe } from "lucide-react";
import { langToStr } from "../../../utils/langToStr.js";

// ユーザーは言語一覧から選択する。
export function LangPicker(props: {
	language: string;
	setLanguage: (lang: string) => void;
}) {
	const languageList = i18next.languages.slice().sort(); // ここでABC順にソートする

	return (
		<div className="flex flex-col justify-center items-center gap-2 p-2 rounded-2xl w-full">
			<Globe className="w-6 h-6" />
			<div className="flex flex-wrap gap-2">
				{languageList.map((lang, index) => (
					<button
						type="button"
						key={index}
						className={`p-2 rounded-xl ${
							lang === props.language
								? "bg-gray-300"
								: "bg-gray-200 hover:bg-gray-300"
						}`}
						onClick={() => props.setLanguage(lang)}
					>
						{langToStr(lang)}
					</button>
				))}
			</div>
		</div>
	);
}
