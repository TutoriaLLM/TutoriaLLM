import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 言語jsonファイルのimport
import translation_en from "./en.json";
import translation_ja from "./ja.json";
import translation_my from "./ms.json";
import translation_id from "./id.json";
import translation_zh from "./zh.json";
import translation_ko from "./ko.json";
import translation_es from "./es.json";
import translation_fr from "./fr.json";
import translation_de from "./de.json";
import translation_it from "./it.json";
import translation_nl from "./nl.json";
import translation_pl from "./pl.json";
import translation_pt from "./pt.json";
import translation_ru from "./ru.json";
import translation_tr from "./tr.json";
import translation_vi from "./vi.json";
import translation_th from "./th.json";
// import translation_ar from "./ar.json";
// import translation_he from "./he.json";
import translation_fa from "./fa.json";
import translation_hi from "./hi.json";
import translation_bn from "./bn.json";
import translation_ta from "./ta.json";
import translation_te from "./te.json";

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

i18n
	.use(initReactI18next) // passes i18n down to react-i18next
	.init({
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
