import type { Guide, TrainingData } from "@/modules/admin/training/schema";
import { generateEmbedding } from "@/modules/admin/training/utils/embedding";

export async function createGuideFromTrainingData(
	trainingData: TrainingData,
): Promise<Guide> {
	//TrainingDataをもとに埋め込みようのデータを作成
	const data = await generateEmbedding(trainingData.question);

	return {
		id: trainingData.id,
		metadata: trainingData.metadata,
		question: trainingData.question,
		answer: trainingData.answer,
		embedding: data,
	};
}
