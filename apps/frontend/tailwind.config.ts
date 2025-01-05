import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import animate from "tailwindcss-animate";
export default {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			keyframes: {
				"caret-blink": {
					"0%, 70%, 100%": {
						opacity: "1",
					},
					"20%, 50%": {
						opacity: "0",
					},
				},
				"loading-flow": {
					"0%": {
						backgroundPosition: "0% 0%",
					},
					"100%": {
						backgroundPosition: "100% 0%",
					},
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
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
			},
		},
	},
	plugins: [
		typography,
		({ addComponents }) => {
			addComponents({});
		},
		animate,
	],
} satisfies Config;
