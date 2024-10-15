/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			keyframes: {
				"caret-blink": {
					"0%,70%,100%": { opacity: "1" },
					"20%,50%": { opacity: "0" },
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
};
