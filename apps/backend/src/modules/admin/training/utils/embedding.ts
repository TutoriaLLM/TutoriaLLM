import { openai } from "@/libs/openai";
import { embed } from "ai";

export async function generateEmbedding(value: string): Promise<number[]> {
	const input = value.replaceAll("\n", " ");

	const { embedding } = await embed({
		model: openai.embedding("text-embedding-3-small"),
		value: input,
	});
	return embedding;
}
