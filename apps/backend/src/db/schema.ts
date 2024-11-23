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
	boolean,
	pgEnum,
} from "drizzle-orm/pg-core";
import type {
	Click,
	Dialogue,
	SavedAudio,
	Stats,
	TutorialStats,
} from "../../type";

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

//アプリセッションの定義
export const responseModeEnum = pgEnum("response_mode", ["text", "audio"]);

export const appSessions = pgTable("app_session", {
	sessioncode: text("session_code").primaryKey(),
	uuid: text("uuid").notNull(),
	createdAt: timestamp("created_at", {
		withTimezone: false,
		mode: "date",
	}).notNull(),
	updatedAt: timestamp("updated_at", {
		withTimezone: false,
		mode: "date",
	}).notNull(),
	dialogue: json("dialogue").$type<Dialogue[]>().notNull(),
	quickReplies: json("quick_replies").$type<string[]>().notNull(),
	isReplying: boolean("is_replying").notNull(),
	workspace: json("workspace").$type<{ [key: string]: string }>().notNull(),
	isVMRunning: boolean("is_vm_running").notNull(),
	clients: json("clients").$type<string[]>().notNull(),
	language: text("language").notNull(),
	easyMode: boolean("easy_mode").notNull(),
	responseMode: responseModeEnum("response_mode").notNull(),
	llmContext: text("llm_context").notNull(),
	tutorial: json("tutorial").$type<TutorialStats>().notNull(),
	stats: json("stats").$type<Stats>().notNull(),
	audios: json("audios").$type<SavedAudio[]>().notNull(),
	userAudio: text("user_audio").notNull(),
	screenshot: text("screenshot").notNull(),
	clicks: json("clicks").$type<Click[]>().notNull(),
});

// チュートリアルの保存

export type TutorialMetadata = {
	title: string;
	description: string;
	selectCount: number;
	author?: string;
};

export const tags = pgTable("tags", {
	id: serial("id").primaryKey(),
	name: text("name").notNull().unique(), // タグ名（ユニーク）
});

export const tutorialsTags = pgTable("tutorials_tags", {
	//中間テーブル
	tutorialId: integer("tutorial_id")
		.notNull()
		.references(() => tutorials.id),
	tagId: integer("tag_id")
		.notNull()
		.references(() => tags.id),
});

export const tutorials = pgTable("tutorials", {
	id: serial("id").primaryKey(),
	content: text("content").notNull(),
	tags: json("tags").$type<string[]>().notNull(),
	language: varchar("language", { length: 255 }).notNull(),
	metadata: json("metadata").$type<TutorialMetadata>().notNull(),
	serializednodes: text("serializednodes").notNull(), // 新しく追加
});

// トレーニングに利用する質問データを保存

export type TrainingMetadata = {
	author?: string;
	date?: string;
	sessionCode?: string;
};

// AIのベ��ス知識の埋め込み
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

export type InsertAppSession = typeof appSessions.$inferInsert;
export type SelectAppSession = typeof appSessions.$inferSelect;

export type InsertTag = typeof tags.$inferInsert;
export type SelectTag = typeof tags.$inferSelect;

export type InsertTutorialsTags = typeof tutorialsTags.$inferInsert;
export type SelectTutorialsTags = typeof tutorialsTags.$inferSelect;

export type InsertTutorial = typeof tutorials.$inferInsert;
export type SelectTutorial = typeof tutorials.$inferSelect;

export type InsertGuide = typeof guides.$inferInsert;
export type SelectGuide = typeof guides.$inferSelect;

export type InsertTrainingData = typeof trainingData.$inferInsert;
export type SelectTrainingData = typeof trainingData.$inferSelect;

//移行が完了するまでの暫定的な型エイリアス
export type User = SelectUser;
export type AuthSession = SelectAuthSession;
export type AppSession = SelectAppSession;
export type Tag = SelectTag;
export type TutorialsTags = SelectTutorialsTags;
export type Tutorial = SelectTutorial;
export type Guide = SelectGuide;
export type TrainingData = SelectTrainingData;
