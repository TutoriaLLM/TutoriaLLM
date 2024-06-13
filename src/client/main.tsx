import "./styles/index.css";

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import NotFound from "./pages/404";
import Editor from "./pages/editorPage";

import "../i18n/client_i18nConfig";

export default function App(): React.ReactElement {
  // アプリのページ定義

  return (
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/:code" element={<Editor />} />
          <Route path="/" element={<Editor />} />
          <Route path="/*/*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}
const domNode = document.getElementById("root")!;
const root = createRoot(domNode);
root.render(<App />);
