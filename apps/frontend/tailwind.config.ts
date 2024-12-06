import type { Config } from "tailwindcss";

export default {
	content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			keyframes: {
				"caret-blink": {
					"0%, 70%, 100%": { opacity: "1" },
					"20%, 50%": { opacity: "0" },
				},
				"loading-flow": {
					"0%": { backgroundPosition: "0% 0%" },
					"100%": { backgroundPosition: "100% 0%" },
				},
				"fade-in": {
					from: {
						opacity: "0",
						filter: "blur(10px)",
					},
					to: {
						opacity: "1",
						filter: "blur(0)",
					},
				},
				"fade-out": {
					from: {
						opacity: "1",
						filter: "blur(0)",
					},
					to: {
						opacity: "0",
						filter: "blur(10px)",
					},
				},
			},
			animation: {
				"caret-blink": "caret-blink 1.2s ease-out infinite",
				"loading-flow": "loading-flow 1s ease-in-out infinite",
				"fade-in": "fade-in 0.15s ease-in forwards",
				"fade-out": "fade-out 0.15s ease-out forwards",
			},
		},
	},
	plugins: [
		require("@tailwindcss/typography"),
		({ addComponents }) => {
			addComponents({});
		},
	],
} satisfies Config;
