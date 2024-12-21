import OpenAI from "openai";

export async function generateEmbedding(value: string): Promise<number[]> {
	const input = value.replaceAll("\n", " ");
	// Create embedding based on data
	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
		baseURL: process.env.OPENAI_API_ENDPOINT || "https://api.openai.com/vi",
	});
	const { data } = await openai.embeddings.create({
		model: "text-embedding-3-small",
		input,
	});
	return data[0].embedding;
}
