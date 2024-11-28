import i18n from "i18next";
// 言語jsonファイルのimport
import translation_en from "@/i18n/en.json";
import translation_ja from "@/i18n/ja.json";
import translation_my from "@/i18n/ms.json";
import translation_id from "@/i18n/id.json";
import translation_zh from "@/i18n/zh.json";
import translation_ko from "@/i18n/ko.json";
import translation_es from "@/i18n/es.json";
import translation_fr from "@/i18n/fr.json";
import translation_de from "@/i18n/de.json";
import translation_it from "@/i18n/it.json";
import translation_nl from "@/i18n/nl.json";
import translation_pl from "@/i18n/pl.json";
import translation_pt from "@/i18n/pt.json";
import translation_ru from "@/i18n/ru.json";
import translation_tr from "@/i18n/tr.json";
import translation_vi from "@/i18n/vi.json";
import translation_th from "@/i18n/th.json";
// import translation_ar from "./ar.json";
// import translation_he from "./he.json";
import translation_fa from "@/i18n/fa.json";
import translation_hi from "@/i18n/hi.json";
import translation_bn from "@/i18n/bn.json";
import translation_ta from "@/i18n/ta.json";
import translation_te from "@/i18n/te.json";

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
	id: {
		translation: translation_id,
	},
	ko: {
		translation: translation_ko,
	},
	es: {
		translation: translation_es,
	},
	fr: {
		translation: translation_fr,
	},
	de: {
		translation: translation_de,
	},
	it: {
		translation: translation_it,
	},
	nl: {
		translation: translation_nl,
	},
	pl: {
		translation: translation_pl,
	},
	pt: {
		translation: translation_pt,
	},
	ru: {
		translation: translation_ru,
	},
	tr: {
		translation: translation_tr,
	},
	vi: {
		translation: translation_vi,
	},
	th: {
		translation: translation_th,
	},
	// ar: {
	// 	translation: translation_ar,
	// },
	// he: {
	// 	translation: translation_he,
	// },
	fa: {
		translation: translation_fa,
	},
	hi: {
		translation: translation_hi,
	},
	bn: {
		translation: translation_bn,
	},
	ta: {
		translation: translation_ta,
	},
	te: {
		translation: translation_te,
	},
};

i18n.init({
	resources,
	fallbackLng: [
		"en",
		"ja",
		"zh",
		"ms",
		"id",
		"ko",
		"es",
		"fr",
		"de",
		"it",
		"nl",
		"pl",
		"pt",
		"ru",
		"tr",
		"vi",
		"th",
		// "ar",
		// "he",
		"fa",
		"hi",
		"bn",
		"ta",
		"te",
	],
	interpolation: {
		escapeValue: false, // react already safes from xss
	},
});

export default i18n;
