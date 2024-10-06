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

export default function App(): React.ReactElement {
	//Sentry/Opentelemetry/GAの実行
	// if (typeof window !== "undefined") FrontendTracer();

	// アプリのページ定義
	return (
		<React.StrictMode>
			<BrowserRouter>
				<FrontendTracer />

				<Routes>
					<Route path="/admin/*" element={<AdminPage />} />
					<Route path="/:code" element={<EditorPage />} />
					<Route path="/*" element={<EditorPage />} />
				</Routes>
			</BrowserRouter>
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
