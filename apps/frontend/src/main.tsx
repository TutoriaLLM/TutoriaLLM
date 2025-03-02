import { scan } from "react-scan";

import { routeTree } from "@/routeTree.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import "@/i18n/i18nConfig";
import "@/styles/index.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// Set up a Router instance
export const queryClient = new QueryClient();

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultStaleTime: 5000,
	context: {
		queryClient,
	},
});

// Register things for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
const isDev = import.meta.env.MODE === "development";
if (isDev) {
	if (typeof window !== "undefined") {
		scan({
			enabled: true,
		});
	}
}
// Disable console.log except when in debug mode
if (!isDev) {
	console.log = () => {};
	console.info = () => {};
}

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const rootElement = document.getElementById("root")!;

const App = () => (
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ReactQueryDevtools initialIsOpen={false} />
			<RouterProvider router={router} />
		</QueryClientProvider>
	</React.StrictMode>
);

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<App />);
}
