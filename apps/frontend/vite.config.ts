import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
// import { visualizer } from "rollup-plugin-visualizer";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig(() => {
	return {
		optimizeDeps: {
			include: ["blockly"],
		},
		css: {
			postcss: {
				plugins: [tailwindcss, autoprefixer],
			},
		},
		plugins: [
			react(),
			TanStackRouterVite(),
			svgr(),
			VitePWA({
				injectRegister: "auto",
				includeAssets: [
					"favicon.ico",
					"apple-touch-icon.png",
					"icon-512-maskable.png",
				],
				registerType: "autoUpdate",
				workbox: {
					maximumFileSizeToCacheInBytes: 5000000,
				},
				manifest: {
					name: "TutoriaLLM",
					short_name: "TutoriaLLM",
					description: "Study Code with AI Tutor",
					theme_color: "#e5e7eb",
					display: "standalone",
					id: "/",
					screenshots: [
						{
							src: "/screenshot.webp",
							sizes: "2944x2098",
							type: "image/webp",
							platform: "wide",
							label: "Workspace of TutoriaLLM",
						},
					],
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
		define: {
			VITE_BACKEND_URL: process.env.VITE_BACKEND_URL,
		},
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
				// plugins: [visualizer() as any],
				output: {
					manualChunks: {
						blockly: ["blockly"],
					},
				},
			},
		},
		server: {
			host: "0.0.0.0",
			hmr: true,
			watch: {
				usePolling: true,
			},
			port: Number(process.env.PORT) || 3000,
		},
		preview: {
			port: Number(process.env.PORT) || 3000,
			strictPort: true,
			host: true,
		},
	};
});
