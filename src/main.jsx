// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
// ---------- AUTO REFRESH JIKA KONTEN KOSONG ----------

ReactDOM.createRoot(root).render(
  <React.StrictMode>

    <BrowserRouter>
      <ErrorBoundary.jsx>
      <App />
     </ErrorBoundary.jsx>
    </BrowserRouter>

  </React.StrictMode>
);

