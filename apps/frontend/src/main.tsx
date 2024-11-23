import "./styles/index.css";

import React from "react";
import { createRoot } from "react-dom/client";
import {
	BrowserRouter,
	Link,
	Route,
	Routes,
	useLocation,
} from "react-router-dom";

import EditorPage from "./pages/editorPage.js";

import "../i18n/client_i18nConfig.js";
import AdminPage from "./pages/adminPage.js";
import FrontendTracer from "./clientTelemetry.js";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function App(): React.ReactElement {
	//Sentry/Opentelemetry/GAの実行

	const isDev = process.env.NODE_ENV === "development";
	// デバッグモードの場合以外は、console.logを無効にする
	if (!isDev) {
		console.log = () => {};
	}
	const queryClient = new QueryClient();

	// アプリのページ定義
	return (
		<React.StrictMode>
			<QueryClientProvider client={queryClient}>
				<BrowserRouter>
					<FrontendTracer />
					<Routes>
						<Route path="/admin/*" element={<AdminPage />} />
						<Route path="/:code" element={<EditorPage />} />
						<Route path="/*" element={<EditorPage />} />
					</Routes>
				</BrowserRouter>
			</QueryClientProvider>
		</React.StrictMode>
	);
}
try {
	const domNode = document.getElementById("root");
	if (!domNode) throw new Error("Root element not found");
	const root = createRoot(domNode);
	root.render(<App />);
} catch (e) {
	console.error(e);
}

// Reactアプリがレンダリングされた後にローディング画面を非表示にする
const loadingElement = document.getElementById("loading");
const rootElement = document.getElementById("root");
if (loadingElement && rootElement) {
	loadingElement.style.display = "none";
	rootElement.style.display = "block";
}
