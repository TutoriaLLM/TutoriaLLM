import path from "node:path";
import { fileURLToPath } from "node:url";
import kuromoji from "kuromoji";

// __dirname の代わりに import.meta.url を使用
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// カタカナをひらがなに変換する関数
function katakanaToHiragana(katakana: string): string {
	return katakana.replace(/[\u30A1-\u30FA]/g, (match) => {
		const charCode = match.charCodeAt(0) - 0x60;
		return String.fromCharCode(charCode);
	});
}

// ルビを適用するための関数
async function applyRuby(content: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const dicPath = path.resolve(__dirname, "dict");

		kuromoji.builder({ dicPath }).build((err, tokenizer) => {
			if (err) return reject(err);

			const tokens = tokenizer.tokenize(content);
			const rubyContent = tokens
				.map((token) => {
					if (token.reading && token.surface_form !== token.reading) {
						// カタカナをひらがなに変換してルビを適用
						const hiraganaReading = katakanaToHiragana(token.reading);
						return `<ruby>${token.surface_form}<rt>${hiraganaReading}</rt></ruby>`;
					}
					return token.surface_form; // そのまま表示
				})
				.join("");

			resolve(rubyContent);
		});
	});
}

export { applyRuby };
