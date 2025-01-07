import { langToStr } from "@/utils/langToStr";
import i18next from "i18next";
import { Globe } from "lucide-react";
import { Select } from "../ui/select";

// The user selects the language from a drop-down.
export function LangPicker(props: {
	language: string;
	setLanguage: (lang: string) => void;
}) {
	const languageList = i18next.languages.slice().sort(); // Sort by ABC order here.

	return (
		<div className="flex justify-center items-center gap-2 p-2 rounded-2xl w-full">
			<Globe className="w-6 h-6" />
			<Select
				value={props.language}
				onChange={(e) => props.setLanguage(e.target.value)}
			>
				{languageList.map((lang, index) => (
					<option key={index} value={lang}>
						{langToStr(lang)}
					</option>
				))}
			</Select>
		</div>
	);
}
