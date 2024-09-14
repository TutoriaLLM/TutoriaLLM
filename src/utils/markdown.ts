import yaml from "js-yaml";

// メタデータを抽出する関数
export function extractMetadata(content: string): {
	metadata: Record<string, any>;
	content: string;
} {
	const metadataDelimiter = "---";
	const parts = content.split(metadataDelimiter);
	if (parts.length >= 3) {
		const metadata = yaml.load(parts[1].trim());
		const markdownContent = parts.slice(2).join(metadataDelimiter).trim();
		return {
			metadata: metadata as Record<string, any>,
			content: `${metadataDelimiter}\n${parts[1].trim()}\n${metadataDelimiter}\n${markdownContent}`,
		};
	}
	return { metadata: {}, content };
}

// フロントマターを削除する関数
export function removeFrontMatter(content: string): string {
	if (!content) {
		// contentがundefinedまたはnullの場合は空文字列を返す
		return "";
	}
	const metadataDelimiter = "---";
	const parts = content.split(metadataDelimiter);
	if (parts.length >= 3) {
		return parts.slice(2).join(metadataDelimiter).trim();
	}
	return content;
}
