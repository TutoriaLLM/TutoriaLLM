import i18n from "i18next";
import { initReactI18next } from "react-i18next";

//manual translations
import translation_en from "@/i18n/en.json";
import translation_ja from "@/i18n/ja.json";

//zod i18n map
import { z } from "zod";
import { zodI18nMap } from "zod-i18n-map";

//zod translations
import jaZodMessages from "zod-i18n-map/locales/ja/zod.json";
import enZodMessages from "zod-i18n-map/locales/en/zod.json";
const resources = {
	ja: {
		translation: translation_ja,
		zod: jaZodMessages,
	},
	en: {
		translation: translation_en,
		zod: enZodMessages,
	},
};

i18n
	.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		resources,
		fallbackLng: Object.keys(resources),
		interpolation: {
			escapeValue: false, // react already safes from xss
		},
	});
z.setErrorMap(zodI18nMap);
export default i18n;
