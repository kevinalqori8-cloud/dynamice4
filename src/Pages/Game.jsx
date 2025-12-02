import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const branches = [
  { 
    label: "🐱 Game Reme", 
    path: "/game/reme", 
    color: "from-purple-500 to-indigo-500",
    description: "Game angka dengan multiplier",
    icon: "🎲"
  },
  { 
    label: "👑 Game Mines",  
    path: "/game/mines",  
    color: "from-cyan-500 to-blue-500",
    description: "Minesweeper klasik",
    icon: "💎"
  },
  { 
    label: "🎡 Lucky Wheel",  
    path: "/game/luckywheel",  
    color: "from-pink-500 to-rose-500",
    description: "Putar roda keberuntungan",
    icon: "🎯"
  },
];

export default function Game() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header dengan glassmorphism */}
      <motion.header 
        className="flex items-center gap-4 p-6 mb-8 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.button 
          onClick={() => nav(-1)} 
          className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ←
        </motion.button>
        <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Pilih Game
        </h1>
      </motion.header>

      {/* Interactive Solar System */}
      <motion.section 
        className="relative w-96 h-96 mb-12 z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Central Logo */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-3 border-yellow-400 cursor-pointer overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl"
          whileHover={{ scale: 1.1, rotate: 360 }}
          transition={{ duration: 0.5 }}
          onClick={() => window.open(`https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`, "_blank")}
        >
          <img src="/pp.png" alt="Logo" className="w-full h-full object-cover" />
        </motion.div>

        {/* Orbiting Game Options */}
        {branches.map((branch, i) => (
          <motion.div
            key={branch.path}
            className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              transform: `rotate(${i * (360 / branches.length)}deg) translateX(140px) rotate(-${i * (360 / branches.length)}deg)`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
            whileHover={{ 
              scale: 1.2,
              transition: { duration: 0.2 }
            }}
            onClick={() => nav(branch.path)}
            title={branch.label}
          >
            <motion.div 
              className={`w-full h-full rounded-full bg-gradient-to-br ${branch.color} shadow-lg flex items-center justify-center border-2 border-white/30`}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20 + i * 5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <span className="text-2xl">{branch.icon}</span>
            </motion.div>
          </motion.div>
        ))}

        {/* Connection Lines */}
        {branches.map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute top-1/2 left-1/2 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"
            style={{
              height: '140px',
              transform: `rotate(${i * (360 / branches.length)}deg)`,
              transformOrigin: 'top',
            }}
          />
        ))}
      </motion.section>

      {/* Modern Game Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl z-10">
        {branches.map((branch, i) => (
          <motion.div
            key={branch.path}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 + i * 0.1 }}
            whileHover={{ 
              y: -10,
              transition: { duration: 0.3 }
            }}
          >
            <button
              onClick={() => nav(branch.path)}
              className={`relative w-full rounded-3xl p-8 text-white font-semibold overflow-hidden bg-gradient-to-br ${branch.color} shadow-2xl group`}
            >
              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="text-5xl mb-4">{branch.icon}</div>
                <h3 className="text-xl font-bold mb-2">{branch.label}</h3>
                <p className="text-sm text-white/80">{branch.description}</p>
              </div>

              {/* Hover effect border */}
              <div className="absolute inset-0 rounded-3xl border-2 border-white/0 group-hover:border-white/30 transition-all duration-300"></div>

              {/* Floating particles */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Game Stats */}
      <motion.div 
        className="mt-12 text-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <p className="text-white/60 text-lg mb-4">
          🎮 Mainkan game dan kumpulkan uang!
        </p>
        <div className="flex justify-center gap-8 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <span>Siapapun bisa menang</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span>Uang global untuk semua</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span>Test keberuntunganmu</span>
          </div>
        </div>
      </motion.div>

      {/* Custom CSS */}
      <style jsx>{`
        .backdrop-blur-sm {
          backdrop-filter: blur(10px);
        }
        .border-3 {
          border-width: 3px;
        }
        .glass-lonjong {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glass-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
