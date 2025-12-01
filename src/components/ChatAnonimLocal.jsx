// src/components/ChatAnonimLocal.jsx
import React, { useState, useEffect } from "react";

const STORAGE_KEY = "chat_anonim";
const MAX_MSG     = 20;
const USER_IP     = "anon_" + Math.floor(Math.random() * 10000);

export default function ChatAnonimLocal() {
  const [msg, setMsg]   = useState("");
  const [msgs, setMsgs] = useState([]);

  // load history
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setMsgs(JSON.parse(raw));
  }, []);

  // scroll bottom
  useEffect(() => {
    const el = document.getElementById("chat-end");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = () => {
    if (!msg.trim()) return;
    const count = parseInt(localStorage.getItem("chatCount") || "0");
    if (count >= MAX_MSG) return alert("Kamu sudah kirim 20 pesan hari ini.");
    const newMsg = {
      text: msg.trim().substring(0, 60),
      userIp: USER_IP,
      timestamp: new Date().toISOString(),
    };
    const updated = [...msgs, newMsg];
    setMsgs(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem("chatCount", String(count + 1));
    setMsg("");
  };

  const handleKey = (e) => e.key === "Enter" && send();

  const bubble = (ip) =>
    ip === USER_IP
      ? "bg-purple-500 text-white self-end rounded-br-none"
      : "bg-gray-200 text-gray-800 self-start rounded-bl-none";
  const align = (ip) => (ip === USER_IP ? "justify-end" : "justify-start");

  return (
    <div className="flex flex-col h-full text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-sm font-medium">Obrolan Anonim</span>
        <span className="text-xs text-white/60">{MAX_MSG - msgs.length} tersisa</span>
      </header>

      {/* Pesan */}
      <main className="flex-1 overflow-y-auto px-4 py-2 space-y-2 text-sm">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${align(m.userIp)}`}>
            <div
              className={`max-w-[70%] px-3 py-2 rounded-2xl shadow ${bubble(
                m.userIp
              )}`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div id="chat-end" />
      </main>

      {/* Input */}
      <footer className="px-4 py-3 border-t border-white/10 flex items-center gap-2">
        <input
          className="flex-1 bg-white/10 placeholder-white/60 px-3 py-2 rounded-full text-sm outline-none border border-white/20 focus:border-white/40"
          placeholder="Ketik pesan..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyPress={handleKey}
          maxLength={60}
        />
        <button
          onClick={send}
          className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition active:scale-95"
        >
          <img src="/paper-plane.png" alt="Kirim" className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}

