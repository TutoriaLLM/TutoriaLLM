import {
	integer,
	varchar,
	json,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

// テーブルの定義
export const users = pgTable("user", {
	id: serial("id").primaryKey(),
	username: varchar("username", { length: 255 }).notNull(),
	password: varchar("password", { length: 255 }).notNull(),
});

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
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertAuthSession = typeof authSessions.$inferInsert;
export type SelectAuthSession = typeof authSessions.$inferSelect;

export type InsertTutorial = typeof tutorials.$inferInsert;
export type SelectTutorial = typeof tutorials.$inferSelect;

//移行が完了するまでの暫定的な型エイリアス
export type User = SelectUser;
export type AuthSession = SelectAuthSession;
export type Tutorial = SelectTutorial;
