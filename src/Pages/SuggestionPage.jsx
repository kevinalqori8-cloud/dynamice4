// src/Pages/SuggestionPage.jsx
import React, { useState } from "react";

export default function SuggestionPage() {
  const [list] = useState(() => {
    const raw = localStorage.getItem("suggestions");
    return raw ? JSON.parse(raw) : [];
  });

  const exportTxt = () => {
    const text = list.map((l, i) => `${i + 1}. ${l.text} (${l.date})`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "suggestions.txt";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-6">
      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => window.history.back()} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">←</button>
        <h1 className="text-xl font-bold">📥 Saran Viewer</h1>
        <button onClick={exportTxt} className="ml-auto glass-button px-4 py-2 rounded-full text-sm">Export .txt</button>
      </header>

      <div className="space-y-3 max-w-3xl mx-auto">
        {list.length ? (
          list.map((l, i) => (
            <div key={i} className="glass-card rounded-lg p-4">
              <div className="text-xs text-white/60 mb-1">{new Date(l.date).toLocaleString()}</div>
              <div>{l.text}</div>
            </div>
          ))
        ) : (
          <p className="text-white/60">Belum ada saran.</p>
        )}
      </div>
    </div>
  );
}

