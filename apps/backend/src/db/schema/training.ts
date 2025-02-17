import type {} from "@/modules/session/schema";
import {
	index,
	json,
	pgTable,
	serial,
	text,
	vector,
} from "drizzle-orm/pg-core";

export type TrainingMetadata = {
	author?: string;
	date?: string;
	sessionId?: string;
};

export const guides = pgTable(
	"guides",
	{
		id: serial("id").primaryKey(),
		metadata: json("metadata").$type<TrainingMetadata>().notNull(),
		question: text("question").notNull(),
		answer: text("answer").notNull(),
		embedding: vector("embedding", { dimensions: 1536 }),
	},
	(table) => ({
		embeddingIndex: index("embeddingIndex").using(
			"hnsw",
			table.embedding.op("vector_cosine_ops"),
		),
	}),
);

export const trainingData = pgTable("training_data", {
	id: serial("id").primaryKey(),
	metadata: json("metadata").$type<TrainingMetadata>().notNull(),
	question: text("question").notNull(),
	answer: text("answer").notNull(),
});
