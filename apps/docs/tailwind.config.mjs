/** @type {import('tailwindcss').Config} */
import starlightPlugin from "@astrojs/starlight-tailwind";

export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	// biome-ignore lint/suspicious/noDuplicateObjectKeys: <explanation>
	plugins: [starlightPlugin()],
	theme: {
		extend: {},
	},
	plugins: [],
};
