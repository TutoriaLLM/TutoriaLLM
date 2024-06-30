export function langToStr(lang: string) {
	const nameGenerator = new Intl.DisplayNames(lang, { type: "language" });
	if (!nameGenerator) {
		return lang;
	}
	return nameGenerator.of(lang);
}
