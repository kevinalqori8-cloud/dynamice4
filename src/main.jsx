// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// ---------- AUTO REFRESH JIKA KONTEN KOSONG ----------
(function () {
  const root = document.getElementById("root");
  // cek setelah 2 detik (biar React selesai render)
  setTimeout(() => {
    if (!root || root.innerHTML.trim() === "") {
      console.warn("[AUTO-REFRESH] Konten kosong → reload sekali");
      window.location.reload();
    }
  }, 2000);
})();
// -----------------------------------------------------

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
	<ErrorBoundary>
      <App />
	</ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);

