import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUserData } from '../hooks/useFirebaseData';
import { userService } from '../service/firebaseService';

const branches = [
  { 
    label: "🐱 Game Reme", 
    path: "/game/reme", 
    color: "from-purple-500 to-indigo-500",
    description: "Game angka dengan multiplier",
    icon: "🎲",
    particleColor: "#8B5CF6"
  },
  { 
    label: "👑 Game Mines",  
    path: "/game/mines",  
    color: "from-cyan-500 to-blue-500",
    description: "Minesweeper klasik",
    icon: "💎",
    particleColor: "#06B6D4"
  },
  { 
    label: "🎡 Lucky Wheel",  
    path: "/game/luckywheel",  
    color: "from-pink-500 to-rose-500",
    description: "Putar roda keberuntungan",
    icon: "🎯",
    particleColor: "#F472B6"
  },
];

// Particle System Component
const ParticleSystem = ({ color, isActive }) => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {isActive && particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              backgroundColor: color,
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [-20, 20],
            }}
            transition={{
              duration: 3,
              delay: particle.delay,
              repeat: Infinity,
              repeatDelay: Math.random() * 2,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// 3D Card Component
const GameCard = ({ branch, index, onClick, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -30 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.2,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        y: -20,
        rotateY: 10,
        transition: { duration: 0.3 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative w-full rounded-3xl p-8 text-white overflow-hidden transform-gpu">
        {/* 3D Background Gradient */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${branch.color} transition-all duration-500 group-hover:scale-110`}
          style={{
            transform: isHovered ? 'translateZ(20px)' : 'translateZ(0px)',
          }}
        />
        
        {/* Glass Effect Layer */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-white/5 to-transparent"></div>
        </div>

        {/* Particle System */}
        <ParticleSystem color={branch.particleColor} isActive={isHovered} />

        {/* Main Content */}
        <div className="relative z-10">
          {/* Icon with floating animation */}
          <motion.div 
            className="text-6xl mb-6 text-center"
            animate={isHovered ? {
              y: [-5, 5, -5],
              rotate: [0, 10, -10, 0],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {branch.icon}
          </motion.div>
          
          {/* Title with glow effect */}
          <motion.h3 
            className="text-2xl font-bold mb-3 text-center relative"
            animate={isHovered ? { scale: 1.05 } : {}}
            transition={{ duration: 0.3 }}
          >
            {branch.label}
            {/* Glow effect */}
            <motion.span 
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent blur-xl"
              animate={isHovered ? { opacity: [0.3, 0.6, 0.3] } : { opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.h3>
          
          {/* Description */}
          <p className="text-sm text-white/80 text-center leading-relaxed">
            {branch.description}
          </p>
        </div>

        {/* Hover Border Effect */}
        <motion.div 
          className="absolute inset-0 rounded-3xl border-2"
          animate={isHovered ? { 
            borderColor: ["rgba(255,255,255,0)", "rgba(255,255,255,0.5)", "rgba(255,255,255,0)"],
          } : { borderColor: "rgba(255,255,255,0)" }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Corner Decorations */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute top-4 right-4 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute bottom-4 left-4 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute bottom-4 right-4 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
    </motion.div>
  );
};

// Main Component
export default function GameHub() {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const { data: userData } = useUserData(playerName || "guest");

  // Initialize player
  useEffect(() => {
    const savedName = localStorage.getItem('gamehub_player_name');
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  const savePlayerName = async (name) => {
    if (!name.trim()) return;
    
    setPlayerName(name.trim());
    localStorage.setItem('gamehub_player_name', name.trim());
    
    await userService.saveUserData(name.trim(), {
      nama: name.trim(),
      money: 1000,
      achievements: []
    });
  };

  const handleGameSelect = (path) => {
    setActiveGame(path);
    setTimeout(() => navigate(path), 500); // Delay untuk animasi
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Animated Background dengan lebih banyak partikel */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Header dengan glassmorphism */}
      <motion.header 
        className="flex items-center gap-4 p-6 mb-8 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.button 
          onClick={() => navigate(-1)} 
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

      {/* Player Name Input */}
      {!playerName && (
        <motion.div 
          className="mb-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h3 className="text-white text-center mb-4">Masukkan Nama Anda</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nama Anda"
              className="bg-white/10 placeholder-white/60 px-4 py-3 rounded-lg outline-none border border-white/20 text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  savePlayerName(e.target.value.trim());
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                if (input.value.trim()) {
                  savePlayerName(input.value.trim());
                }
              }}
              className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg text-white"
            >
              Simpan
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      {playerName && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl z-10"
        >
          {/* Welcome Message */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              Selamat datang, {playerName}!
            </h2>
            <p className="text-white/60">
              Saldo Anda: <span className="text-yellow-400 font-bold">Rp {userData?.money?.toLocaleString() || '0'}</span>
            </p>
          </motion.div>

          {/* Game Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {branches.map((branch, i) => (
              <GameCard
                key={branch.path}
                branch={branch}
                index={i}
                onClick={() => handleGameSelect(branch.path)}
                isActive={activeGame === branch.path}
              />
            ))}
          </div>

          {/* Additional Features */}
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <p className="text-white/60 text-lg mb-6">
              🎮 Mainkan game dan kumpulkan uang!
            </p>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <motion.div 
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-3xl mb-3">🏆</div>
                <h4 className="text-white font-semibold mb-2">Siapapun Bisa Menang</h4>
                <p className="text-white/60 text-sm">Game dengan sistem fair dan transparan</p>
              </motion.div>
              
              <motion.div 
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-3xl mb-3">💰</div>
                <h4 className="text-white font-semibold mb-2">Uang Global</h4>
                <p className="text-white/60 text-sm">Saldo tersimpan otomatis di cloud</p>
              </motion.div>
              
              <motion.div 
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-3xl mb-3">🎯</div>
                <h4 className="text-white font-semibold mb-2">Test Keberuntungan</h4>
                <p className="text-white/60 text-sm">Buktikan skill dan strategi Anda</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Custom CSS */}
      <style jsx>{`
        .backdrop-blur-sm {
          backdrop-filter: blur(10px);
        }
        .transform-gpu {
          transform: translateZ(0);
        }
      `}</style>
    </div>
  );
}

