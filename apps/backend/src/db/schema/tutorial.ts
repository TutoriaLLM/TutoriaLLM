import type {} from "@/modules/session/schema";
import type { Tags } from "@/modules/tutorials/schema";
import {
	integer,
	json,
	pgTable,
	serial,
	text,
	varchar,
} from "drizzle-orm/pg-core";
// Save Tutorial

export type TutorialMetadata = {
	title: string;
	description: string;
	selectCount: number;
	author?: string;
};

export const tags = pgTable("tags", {
	id: serial("id").primaryKey(),
	name: text("name").notNull().unique(), // Tag Name (Unique)
});

export const tutorialsTags = pgTable("tutorials_tags", {
	// intermediate table
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
	serializedNodes: text("serializedNodes").notNull(), // Newly added
});
