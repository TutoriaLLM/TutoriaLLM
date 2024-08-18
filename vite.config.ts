import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
	optimizeDeps: {
		include: ["blockly"],
	},
	plugins: [
		react(),
		svgr(),
		VitePWA({
			injectRegister: "auto",
			includeAssets: [
				"favicon.ico",
				"apple-touch-icon.png",
				"icon-512-maskable.png",
			],
			registerType: "autoUpdate",
			devOptions: { enabled: true },
			manifest: {
				name: "TutoriaLLM",
				short_name: "TutoriaLLM",
				description: "Study Code with AI Tutor",
				theme_color: "#e5e7eb",
				display: "standalone",
				icons: [
					{
						src: "/pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "/pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "/pwa-maskable-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "maskable",
					},
					{
						src: "/pwa-maskable-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			"@": "/src",
		},
	},
	build: {
		commonjsOptions: {
			include: [/node_modules/],
		},
		rollupOptions: {
			output: {
				manualChunks: {
					blockly: ["blockly"],
				},
			},
		},
	},
});
