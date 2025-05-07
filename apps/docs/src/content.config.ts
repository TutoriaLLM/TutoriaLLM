import { defineCollection } from "astro:content";
import { docsSchema } from "@astrojs/starlight/schema";
import { glob } from "astro/loaders";

const docs = defineCollection({
	loader: glob({
		pattern: ["**/*.md", "**/*.mdx"],
		base: "./src/content/docs",
	}),
	schema: docsSchema(),
});

export const collections = {
	docs,
};
