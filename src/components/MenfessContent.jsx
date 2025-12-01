// src/components/MenfessContent.jsx
import React, { useState, useEffect } from "react";
import {
  collection, addDoc, onSnapshot, orderBy, query, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth"; // opsional, kalau mau login

export default function MenfessContent() {
  const [to, setTo]   = useState("");
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState([]);
  const userNumber = "083124467227"; // nanti pakai login / input pertama

  const colRef = collection(db, "menfess");

  // realtime pesan (out & in)
  useEffect(() => {
    const q = query(colRef, orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snap) =>
      setMsgs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, []);

  const send = async () => {
    if (!to.trim() || !text.trim()) return;
    await addDoc(colRef, {
      fromNumber: userNumber,
      toNumber: to.trim(),
      text: text.trim(),
      direction: "out",
      timestamp: serverTimestamp(),
    });
    // kosongkan form
    setText("");
    // ➜ trigger webhook (cloud function) akan otomatis
  };

  return (
    <div className="flex flex-col h-full text-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
        <span className="text-sm">Kirim ke</span>
        <input
          className="flex-1 bg-white/10 placeholder-white/60 px-3 py-1 rounded-full text-sm outline-none border border-white/20 focus:border-white/40"
          placeholder="08xx (nomor WA)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      {/* Pesan (out & in) */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 text-sm">
        {msgs.map((m) => (
          <div
            key={m.id}
            className={`max-w-[70%] px-3 py-2 rounded-2xl shadow ${
              m.direction === "out"
                ? "bg-purple-500 text-white self-end rounded-br-none"
                : "bg-gray-200 text-gray-800 self-start rounded-bl-none"
            }`}
          >
            <div className="text-[10px] opacity-80 mb-1">
              {m.direction === "out" ? "Kamu → " + m.toNumber : m.fromNumber + " → Kamu"}
            </div>
            {m.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2">
        <input
          className="flex-1 bg-white/10 placeholder-white/60 px-3 py-2 rounded-full text-sm outline-none border border-white/20 focus:border-white/40"
          placeholder="Tulis pesan..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && send()}
        />
        <button
          onClick={send}
          className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition"
        >
          <img src="/paper-plane.png" alt="Kirim" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

