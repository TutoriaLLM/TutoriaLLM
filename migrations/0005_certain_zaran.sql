CREATE TABLE IF NOT EXISTS "guides" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"source" text NOT NULL,
	"embedding" vector(1536)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "embeddingIndex" ON "guides" USING hnsw ("embedding" vector_cosine_ops);