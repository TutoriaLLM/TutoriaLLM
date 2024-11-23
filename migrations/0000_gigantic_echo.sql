DO $$ BEGIN
 CREATE TYPE "public"."response_mode" AS ENUM('text', 'audio');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app_session" (
	"session_code" text PRIMARY KEY NOT NULL,
	"uuid" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"dialogue" json NOT NULL,
	"quick_replies" json NOT NULL,
	"is_replying" boolean NOT NULL,
	"workspace" json NOT NULL,
	"is_vm_running" boolean NOT NULL,
	"clients" json NOT NULL,
	"language" text NOT NULL,
	"easy_mode" boolean NOT NULL,
	"response_mode" "response_mode" NOT NULL,
	"llm_context" text NOT NULL,
	"tutorial" json NOT NULL,
	"stats" json NOT NULL,
	"audios" json NOT NULL,
	"user_audio" text NOT NULL,
	"screenshot" text NOT NULL,
	"clicks" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guides" (
	"id" serial PRIMARY KEY NOT NULL,
	"metadata" json NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"embedding" vector(1536)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "training_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"metadata" json NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tutorials" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"tags" json NOT NULL,
	"language" varchar(255) NOT NULL,
	"metadata" json NOT NULL,
	"serializednodes" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tutorials_tags" (
	"tutorial_id" integer NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tutorials_tags" ADD CONSTRAINT "tutorials_tags_tutorial_id_tutorials_id_fk" FOREIGN KEY ("tutorial_id") REFERENCES "public"."tutorials"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tutorials_tags" ADD CONSTRAINT "tutorials_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "embeddingIndex" ON "guides" USING hnsw ("embedding" vector_cosine_ops);