import { OpenAIEmbeddings } from "@langchain/openai";

export async function getVector(text: string) {
  const embeddings = new OpenAIEmbeddings();
  const response = await embeddings.embedQuery(text);
  return response;
}
