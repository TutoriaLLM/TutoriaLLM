import i18next from "i18next";
import { Globe } from "lucide-react";

// ユーザーは言語一覧から選択する。
export function LangPicker(props: {
  language: string;
  setLanguage: (lang: string) => void;
}) {
  const languageList = i18next.languages.slice().sort(); // ここでABC順にソートする

  function langToStr(lang: string) {
    const nameGenerator = new Intl.DisplayNames(lang, { type: "language" });
    if (!nameGenerator) {
      return lang;
    }
    return nameGenerator.of(lang);
  }

  return (
    <div className="flex flex-col justify-center items-center gap-2 p-2 rounded-2xl w-full">
      <Globe className="w-6 h-6" />
      <div className="flex flex-wrap gap-2">
        {languageList.map((lang, index) => (
          <button
            key={index}
            className={`p-2 rounded-xl ${
              lang === props.language ? "bg-stone-300" : "bg-stone-100"
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
