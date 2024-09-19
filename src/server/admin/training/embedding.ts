import OpenAI from "openai";

export async function generateEmbedding(value: string): Promise<number[]> {
	const input = value.replaceAll("\n", " ");
	//データをもとに埋め込みを作成
	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
	});
	const { data } = await openai.embeddings.create({
		model: "text-embedding-3-small",
		input,
	});
	return data[0].embedding;
}
