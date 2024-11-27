import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { trainingData, type TrainingData } from "../db/schema";
import { getConfig } from "../modules/config";

//トレーニングデータを生成し、保存するAPI。内部でも使用される。
export default async function generateTrainingData(
	question: string,
	metadata: TrainingData["metadata"],
	response: string,
) {
	const config = getConfig();
	try {
		//１００件以上のデータがある場合、最も古いデータを削除
		await db
			.delete(trainingData)
			.where(
				eq(
					trainingData.id,
					db
						.select({ id: trainingData.id })
						.from(trainingData)
						.orderBy(asc(trainingData.id))
						.limit(1),
				),
			);

		await db.insert(trainingData).values({
			metadata: metadata,
			question: question,
			answer: response,
		});
	} catch (e) {
		console.error(e);
	}
}
