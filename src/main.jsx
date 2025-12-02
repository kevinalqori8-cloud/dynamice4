// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/next"

// ---------- AUTO REFRESH JIKA KONTEN KOSONG ----------
(function () {
  const root = document.getElementById("root");
  // cek setelah 2 detik (biar React selesai render)
  setTimeout(() => {
    if (!root || root.innerHTML.trim() === "") {
      console.warn("[AUTO-REFRESH] Konten kosong → reload sekali");
      window.location.reload();
    }
  }, 1000);
})();
// -----------------------------------------------------

ReactDOM.createRoot(root).render(
  <React.StrictMode>
	<Analytics>
    <BrowserRouter>
      <ErrorBoundary>
      <App />
      </ErrorBoundary>
    </BrowserRouter>
	</Analytics>
  </React.StrictMode>
);

