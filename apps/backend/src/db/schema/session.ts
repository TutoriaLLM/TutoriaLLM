import type {
	Click,
	Dialogue,
	SavedAudio,
	Stats,
	TutorialStats,
} from "@/modules/session/schema";
import {
	boolean,
	json,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";
// Definition of an app session
export const responseModeEnum = pgEnum("response_mode", ["text", "audio"]);

export const appSessions = pgTable("app_session", {
	uuid: uuid("uuid").primaryKey(),
	sessionId: text("session_id").notNull(), // use nanoid
	createdAt: timestamp("created_at", {
		withTimezone: true,
		mode: "string",
	}).notNull(),
	updatedAt: timestamp("updated_at", {
		withTimezone: true,
		mode: "string",
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
	userInfo: text("user_id").references(() => user.id),
});

export const appSessionsRelations = relations(appSessions, ({ one }) => ({
	userInfo: one(user, {
		fields: [appSessions.userInfo],
		references: [user.id],
	}),
}));
