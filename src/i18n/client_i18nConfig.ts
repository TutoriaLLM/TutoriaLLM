import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 言語jsonファイルのimport
import translationEn from "./en.json";
import translationJa from "./ja.json";
import translationMy from "./ms.json";
import translationZh from "./zh.json";

const resources = {
  ja: {
    translation: translationJa,
  },
  en: {
    translation: translationEn,
  },
  zh: {
    translation: translationZh,
  },
  ms: {
    translation: translationMy,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en", //Default Language
    fallbackLng: ["en", "ja", "zh", "ms"], //Languages
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
