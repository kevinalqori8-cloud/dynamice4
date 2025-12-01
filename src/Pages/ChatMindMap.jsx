// src/Pages/ChatMindMap.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const branches = [
  { label: "💡 Suggestion", path: "/chat/suggestion", color: "from-cyan-500 to-blue-500" },
  { label: "💬 Chat Anonim",path: "/chat/anonim",  color: "from-purple-500 to-indigo-500" },
];

export default function ChatMindMap() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold text-white mb-10" data-aos="fade-down">Pilih Jalur Obrolan</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        {branches.map((b) => (
          <button
            key={b.path}
            onClick={() => nav(b.path)}
            className={`relative rounded-2xl p-6 text-white font-semibold text-lg overflow-hidden 
                        bg-gradient-to-br ${b.color} shadow-lg hover:scale-105 transition-transform duration-300`}
            data-aos="zoom-in"
            data-aos-delay="100"
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <span className="relative">{b.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
