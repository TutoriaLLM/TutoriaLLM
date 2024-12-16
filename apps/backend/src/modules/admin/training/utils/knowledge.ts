import { db } from "@/db";
import { guides } from "@/db/schema";
import type { Guide } from "@/modules/admin/training/schema";
import { generateEmbedding } from "@/modules/admin/training/utils/embedding";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";

//Vectorをもとに知識を検索するAPI
export async function getKnowledge(
	searchString: string,
): Promise<Guide[] | string> {
	const embedding = await generateEmbedding(searchString);
	const similarity = sql<number>`1 - (${cosineDistance(guides.embedding, embedding)})`;
	try {
		const similarGuides = await db
			.select()
			.from(guides)
			.where(gt(similarity, 0.3))
			.orderBy((t) => desc(similarity))
			.limit(5);
		return similarGuides;
	} catch (e) {
		console.error(e);
		return "Failed to search guides";
	}
}
