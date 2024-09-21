CREATE TABLE IF NOT EXISTS "training_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"metadata" json NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guides" ADD COLUMN "metadata" json NOT NULL;--> statement-breakpoint
ALTER TABLE "guides" ADD COLUMN "question" text NOT NULL;--> statement-breakpoint
ALTER TABLE "guides" ADD COLUMN "answer" text NOT NULL;--> statement-breakpoint
ALTER TABLE "guides" DROP COLUMN IF EXISTS "title";--> statement-breakpoint
ALTER TABLE "guides" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "guides" DROP COLUMN IF EXISTS "source";