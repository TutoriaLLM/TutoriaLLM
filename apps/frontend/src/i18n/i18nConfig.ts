import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

//manual translations
import translation_en from "@/i18n/en.json";
import translation_ja from "@/i18n/ja.json";

//zod i18n map
import { z } from "zod";
import { makeZodI18nMap } from "zod-i18n-map";

//zod translations
import jaZodMessages from "zod-i18n-map/locales/ja/zod.json";
import enZodMessages from "zod-i18n-map/locales/en/zod.json";
const resources = {
	ja: {
		translation: translation_ja,
		zod: jaZodMessages,
		custom: {
			password_mismatch: "パスワードが一致しません",
		},
	},
	en: {
		translation: translation_en,
		zod: enZodMessages,
		custom: {
			password_mismatch: "Passwords do not match",
		},
	},
};

i18n
	.use(initReactI18next) // passes i18n down to react-i18next
	.use(LanguageDetector)
	.init({
		lng: undefined,
		detection: {
			order: ["cookie"],
			lookupCookie: "i18next",
			caches: ["cookie"],
		},
		resources,
		fallbackLng: Object.keys(resources),
		interpolation: {
			escapeValue: false, // react already safes from xss
		},
	});
z.setErrorMap(makeZodI18nMap({ ns: ["zod", "custom"] }));
export default i18n;
