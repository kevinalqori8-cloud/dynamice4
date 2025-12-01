// src/Pages/ChatMindMap.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const branches = [
  { label: "💬 Chat Anonim", path: "/chat/anonim", color: "from-purple-500 to-indigo-500" },
  { label: "💡 Suggestion",  path: "/suggestion",  color: "from-cyan-500 to-blue-500" },
];

export default function ChatMindMap() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-bold text-white mb-8" data-aos="fade-down">Pilih Jalur</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xs">
        {branches.map((b) => (
          <button
            key={b.path}
            onClick={() => nav(b.path)}
            className={`relative rounded-xl p-4 text-white font-semibold text-sm overflow-hidden bg-gradient-to-br ${b.color} shadow-lg hover:scale-105 transition-transform`}
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <span className="relative">{b.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

