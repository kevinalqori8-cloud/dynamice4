import React from "react";
import { useNavigate } from "react-router-dom";

const branches = [
  { label: "🐱 Game Reme", path: "/game/reme", color: "from-purple-500 to-indigo-500" },
  { label: "👑 Game Mines",  path: "/game/mines",  color: "from-cyan-500 to-blue-500" },
];

export default function ChatMindMap() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black flex flex-col items-center justify-center px-6">
      {/* Header */}
      <header className="flex items-center gap-3 p-6">
        <button onClick={() => nav(-1)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">←</button>
        <h1 className="text-xl font-bold text-white">Pilih Jalur</h1>
      </header>

      {/* Tata Surya – DESAIN SAJA (tanpa data/edit) */}
      <section className="relative w-80 h-80 mb-10">
        {/* Logo di tengah (bisa klik) */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-yellow-400 cursor-pointer overflow-hidden"
          onClick={() => window.open(`https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`, "_blank")}
        >
          <img src="/pp.png" alt="Logo" className="w-full h-full object-cover" />
        </div>

        {/* Orbit Cabang (skill/icon) */}
        {branches.map((b, i) => (
          <div
            key={b.path}
            className="absolute top-1/2 left-1/2 w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer"
            style={{
              transform: `rotate(${i * (360 / branches.length)}deg) translateX(120px) rotate(-${i * (360 / branches.length)}deg)`,
              animation: `orbit 10s linear infinite`,
              animationDelay: `${i * 1.5}s`,
            }}
            onClick={() => nav(b.path)}
            title={b.label}
          >
            <div className={`w-full h-full rounded-full bg-gradient-to-br ${b.color} shadow-lg flex items-center justify-center`}>
              <span className="relative">{b.label.charAt(0)}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Tombol Cabang (mirip Amine) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
        {branches.map((b) => (
          <button
            key={b.path}
            onClick={() => nav(b.path)}
            className={`relative rounded-xl p-6 text-white font-semibold text-sm overflow-hidden bg-gradient-to-br ${b.color} shadow-lg hover:scale-105 transition-transform`}
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <span className="relative">{b.label}</span>
          </button>
        ))}
      </div>

      {/* CSS orbit animasi */}
      <style jsx>{`
        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(120px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(120px) rotate(-360deg);
          }
        }
      `}</style>
    </div>
  );
}


