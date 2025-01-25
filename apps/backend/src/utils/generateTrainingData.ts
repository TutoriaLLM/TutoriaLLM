import { db } from "@/db";
import type { TrainingData } from "@/db/schema";
import { trainingData } from "@/db/schema/training";
import { getConfig } from "@/modules/config";
import { asc, eq } from "drizzle-orm";

// API to generate and store training data, also used internally.
export default async function generateTrainingData(
	question: string,
	metadata: TrainingData["metadata"],
	response: string,
) {
	const config = getConfig();
	try {
		// If there are more than 100 data, delete the oldest data
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
