import path from "node:path";
import { fileURLToPath } from "node:url";
import kuromoji from "kuromoji";

// Use import.meta.url instead of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to convert katakana to hiragana
function katakanaToHiragana(katakana: string): string {
	return katakana.replace(/[\u30A1-\u30FA]/g, (match) => {
		const charCode = match.charCodeAt(0) - 0x60;
		return String.fromCharCode(charCode);
	});
}

// Functions for applying ruby
async function applyRuby(content: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const dicPath = path.resolve(__dirname, "dict");

		kuromoji.builder({ dicPath }).build((err, tokenizer) => {
			if (err) return reject(err);

			const tokens = tokenizer.tokenize(content);
			const rubyContent = tokens
				.map((token) => {
					// Only target tokens with kanji characters.
					if (
						token.pos === "名詞" &&
						token.pos_detail_1 === "一般" &&
						token.reading &&
						token.surface_form !== token.reading
					) {
						// Convert katakana to hiragana and apply ruby
						const hiraganaReading = katakanaToHiragana(token.reading);
						return `<ruby>${token.surface_form}<rt>${hiraganaReading}</rt></ruby>`;
					}
					return token.surface_form; // Display as is
				})
				.join("");

			resolve(rubyContent);
		});
	});
}

export { applyRuby };
