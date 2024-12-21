import i18n from "i18next";
export function setLanguageState(setLanguage: (lang: string) => void) {
	const detectedLanguage = navigator.language || i18n.language;
	const baseLanguage = detectedLanguage.split("-")[0]; // Get the base language code
	const supportedLanguages = i18n.languages;
	const language = supportedLanguages.includes(baseLanguage)
		? baseLanguage
		: "en"; // Default to English if the detected language is not supported
	setLanguage(language);
}
