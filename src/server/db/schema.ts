import {
	integer,
	varchar,
	json,
	pgTable,
	serial,
	text,
	timestamp,
	vector,
	index,
} from "drizzle-orm/pg-core";

// ユーザーの定義

export const users = pgTable("user", {
	id: serial("id").primaryKey(),
	username: varchar("username", { length: 255 }).notNull(),
	password: varchar("password", { length: 255 }).notNull(),
});

// ログインセッションの定義

export const authSessions = pgTable("session", {
	id: text("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
});

// チュートリアルの保存

export type TutorialMetadata = {
	title: string;
	description: string;
	author?: string;
	keywords?: string[];
};

export const tutorials = pgTable("tutorials", {
	id: serial("id").primaryKey(),
	content: text("content").notNull(),
	metadata: json("metadata").$type<TutorialMetadata>().notNull(),
	serializednodes: text("serializednodes").notNull(), // 新しく追加
});

// トレーニングに利用する質問データを保存

export type TrainingMetadata = {
	author?: string;
	date?: string;
	sessionCode?: string;
};

// AIのベース知識の埋め込み
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

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertAuthSession = typeof authSessions.$inferInsert;
export type SelectAuthSession = typeof authSessions.$inferSelect;

export type InsertTutorial = typeof tutorials.$inferInsert;
export type SelectTutorial = typeof tutorials.$inferSelect;

export type InsertGuide = typeof guides.$inferInsert;
export type SelectGuide = typeof guides.$inferSelect;

export type InsertTrainingData = typeof trainingData.$inferInsert;
export type SelectTrainingData = typeof trainingData.$inferSelect;

//移行が完了するまでの暫定的な型エイリアス
export type User = SelectUser;
export type AuthSession = SelectAuthSession;
export type Tutorial = SelectTutorial;
export type Guide = SelectGuide;
export type TrainingData = SelectTrainingData;
