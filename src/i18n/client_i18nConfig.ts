import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 言語jsonファイルのimport
import translation_en from "./en.json";
import translation_ja from "./ja.json";
import translation_my from "./ms.json";
import translation_zh from "./zh.json";

const resources = {
	ja: {
		translation: translation_ja,
	},
	en: {
		translation: translation_en,
	},
	zh: {
		translation: translation_zh,
	},
	ms: {
		translation: translation_my,
	},
};

i18n
	.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		resources,
		fallbackLng: ["en", "ja", "zh", "ms"], //Languages
		interpolation: {
			escapeValue: false, // react already safes from xss
		},
	});

export default i18n;
