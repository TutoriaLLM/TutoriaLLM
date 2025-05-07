import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightOpenAPI, { openAPISidebarGroups } from "starlight-openapi";
import starlightLinksValidator from "starlight-links-validator";
import { loadEnv } from "vite";

import tailwindcss from "@tailwindcss/vite";
import type { ViteUserConfig } from "astro";

// https://astro.build/config
export default defineConfig({
	markdown: {
		shikiConfig: {
			theme: "github-light",
		},
	},

	integrations: [
		starlight({
			plugins: [
				starlightLinksValidator(), // Generate the OpenAPI documentation pages.
				starlightOpenAPI([
					{
						base: "api",
						label: "API リファレンス",
						schema:
							loadEnv(process.env.OPENAPI_DOCS_URL as string, process.cwd(), "")
								.OPENAPI_DOCS_URL || "http://localhost:3001/doc",
					},
					{
						base: "en/api",
						label: "API Reference",
						schema:
							loadEnv(process.env.OPENAPI_DOCS_URL as string, process.cwd(), "")
								.OPENAPI_DOCS_URL || "http://localhost:3001/doc",
					},
				]),
			],
			title: "TutoriaLLM",
			customCss: [
				// カスタムCSSファイルへの相対パス
				"./src/global.css",
				"./src/styles.css",
				"./src/fonts/IBMPlexMono-ExtraLightItalic.css",
			],
			components: {
				SiteTitle: "./src/components/SiteTitle.astro",
				Sidebar: "./src/components/Sidebar.astro",
			},
			// このサイトのデフォルト言語として日本語を設定します。
			defaultLocale: "root",
			locales: {
				// 日本語のドキュメントは`src/content/docs/`に置きます。
				root: {
					label: "日本語",
					lang: "ja",
				},
				//英語のドキュメントは`src/content/docs/en/`に置きます。
				en: {
					label: "English",
					lang: "en",
				},
			},
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/tutoriallm/",
				},
				{
					icon: "discord",
					label: "Discord",
					href: "https://discord.gg/zxuREnWVXC",
				},
			],
			sidebar: [
				{
					label: "はじめに",
					translations: {
						en: "Introduction",
					},
					autogenerate: {
						directory: "introduction",
					},
				},
				{
					label: "開発者向け",
					translations: {
						en: "Developer Guide",
					},
					autogenerate: {
						directory: "developer",
						collapsed: true,
					},
				},

				...openAPISidebarGroups,
			],
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	} as ViteUserConfig,
});
