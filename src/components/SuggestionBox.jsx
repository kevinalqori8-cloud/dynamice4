// src/components/SuggestionBox.jsx
import React, { useState } from "react";

export default function SuggestionBox() {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  const send = () => {
    if (!text.trim()) return;
    // cukup simpan di localStorage (editor bisa export manual)
    const prev = JSON.parse(localStorage.getItem("suggestions") || "[]");
    localStorage.setItem(
      "suggestions",
      JSON.stringify([
        ...prev,
        { text: text.trim(), date: new Date().toISOString() },
      ])
    );
    setText("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div
      className="glass-card rounded-2xl p-5 max-w-md mx-auto"
      data-aos="fade-up"
    >
      <h3 className="text-white font-bold mb-3">💡 Kotak Saran</h3>
      <textarea
        className="w-full bg-white/10 placeholder-white/60 text-white rounded-lg p-3 outline-none border border-white/20 focus:border-white/40"
        rows="3"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tulis saran / kritikmu di sini..."
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-white/60">{text.length}/200</span>
        <button
          onClick={send}
          className="glass-button px-4 py-2 rounded-full text-sm"
        >
          Kirim
        </button>
      </div>
      {sent && (
        <p className="text-green-400 text-xs mt-2">Tersimpan! Terima kasih.</p>
      )}
    </div>
  );
}

