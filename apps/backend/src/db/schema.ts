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
} from "@/modules/session/schema";
import type { Tags } from "@/modules/tutorials/schema";

// WARN: DO NOT GENERATE ZOD SCHEMA FROM THIS FILE

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
	sessioncode: text("session_code").primaryKey().notNull(),
	uuid: text("uuid").notNull(),
	createdAt: timestamp("created_at", {
		withTimezone: false,
		mode: "date",
	}).notNull(),
	updatedAt: timestamp("updated_at", {
		withTimezone: false,
		mode: "date",
	}).notNull(),
	dialogue: json("dialogue").$type<Dialogue[]>(),
	quickReplies: json("quick_replies").$type<string[]>(),
	isReplying: boolean("is_replying").notNull(),
	workspace: json("workspace").$type<{ [key: string]: string }>(),
	isVMRunning: boolean("is_vm_running").notNull(),
	clients: json("clients").$type<string[]>(),
	language: text("language").default("en"),
	easyMode: boolean("easy_mode").default(false),
	responseMode: responseModeEnum("response_mode").notNull().default("text"),
	llmContext: text("llm_context"),
	tutorial: json("tutorial").$type<TutorialStats>().notNull(),
	stats: json("stats").$type<Stats>().notNull(),
	audios: json("audios").$type<SavedAudio[]>(),
	userAudio: text("user_audio"),
	screenshot: text("screenshot"),
	clicks: json("clicks").$type<Click[]>(),
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
	tags: json("tags").$type<Tags>().notNull(),
	language: varchar("language", { length: 255 }).notNull(),
	metadata: json("metadata").$type<TutorialMetadata>().notNull(),
	serializednodes: text("serializednodes").notNull(), // 新しく追加
});

export type TrainingMetadata = {
	author?: string;
	date?: string;
	sessionCode?: string;
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
