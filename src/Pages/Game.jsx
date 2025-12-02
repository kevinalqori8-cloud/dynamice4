import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUserData } from '../hooks/useFirebaseData';
import { userService } from '../service/firebaseService';

const branches = [
  { 
    label: "Game Reme", 
    path: "/game/reme", 
    color: "from-purple-500 to-indigo-500",
    description: "Game angka dengan multiplier",
    icon: "🎲",
    particleColor: "#8B5CF6",
    thumbnail: "/thumbnails/gamereme.jpg", // ⭐ Thumbnail bisa Anda ganti
    category: "Strategy",
    difficulty: "Medium"
  },
  { 
    label: "Game Mines",  
    path: "/game/mines",  
    color: "from-cyan-500 to-blue-500",
    description: "Minesweeper klasik",
    icon: "💎",
    particleColor: "#06B6D4",
    thumbnail: "/thumbnails/mines.jpg", // ⭐ Thumbnail bisa Anda ganti
    category: "Puzzle",
    difficulty: "Hard"
  },
  { 
    label: "Lucky Wheel",  
    path: "/game/luckywheel",  
    color: "from-pink-500 to-rose-500",
    description: "Putar roda keberuntungan",
    icon: "🎯",
    particleColor: "#F472B6",
    thumbnail: "/thumbnails/luckywheel.jpg", // ⭐ Thumbnail bisa Anda ganti
    category: "Luck",
    difficulty: "Easy"
  },
];

// Tambahkan ParticleSystem component yang sebelumnya tidak ada
const ParticleSystem = ({ color, isActive }) => {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 3,
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
              y: [-30, 30],
            }}
            transition={{
              duration: 4,
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


// Thumbnail Component dengan 3D effect
const GameThumbnail = ({ src, alt, isHovered }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4">
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"
        animate={isHovered ? { opacity: 0.3 } : { opacity: 0.6 }}
        transition={{ duration: 0.3 }}
      />
      
      {imageError || !src ? (
        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
          <span className="text-6xl opacity-30">{alt}</span>
        </div>
      ) : (
        <motion.img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      
      {/* Glow effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent blur-xl"
        animate={isHovered ? { opacity: [0.2, 0.4, 0.2] } : { opacity: 0 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
};

// Compact Name Input untuk Mobile
const CompactNameInput = ({ onSave }) => {
  const [name, setName] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName("");
      setIsExpanded(false);
    }
  };

  return (
    <motion.div 
      className="fixed top-4 left-4 right-4 z-50"
      initial={false}
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={{
        collapsed: { width: 60, height: 60 },
        expanded: { width: "auto", height: "auto" }
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {!isExpanded ? (
        <motion.button
          onClick={() => setIsExpanded(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-xl">👤</span>
        </motion.button>
      ) : (
        <motion.div 
          className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Anda"
              className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Simpan
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Game Card Component dengan Marketplace Style
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
      <div className="relative w-full rounded-3xl overflow-hidden transform-gpu">
        {/* 3D Background Gradient */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${branch.color} transition-all duration-500 group-hover:scale-110`}
          style={{
            transform: isHovered ? 'translateZ(20px)' : 'translateZ(0px)',
          }}
        />
        
        {/* Glass Effect Layer */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Thumbnail */}
        <GameThumbnail 
          src={branch.thumbnail} 
          alt={branch.label} 
          isHovered={isHovered}
        />

        {/* Content Overlay */}
        <div className="relative z-10 p-6">
          {/* Header dengan icon dan kategori */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">{branch.icon}</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-white/20 rounded text-xs">
                {branch.category}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                branch.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                branch.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {branch.difficulty}
              </span>
            </div>
          </div>

          {/* Title */}
          <motion.h3 
            className="text-xl font-bold mb-2 text-white"
            animate={isHovered ? { scale: 1.05 } : {}}
            transition={{ duration: 0.3 }}
          >
            {branch.label}
          </motion.h3>
          
          {/* Description */}
          <p className="text-sm text-white/80 mb-4 leading-relaxed">
            {branch.description}
          </p>

          {/* Play Button */}
          <motion.div 
            className="flex items-center justify-between"
            animate={isHovered ? { x: 0 } : { x: -10 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-white/60 text-sm">Tap to play</span>
            <motion.div 
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
              animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
            >
              <span className="text-white">▶</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Hover effects */}
        <motion.div 
          className="absolute inset-0 rounded-3xl border-2"
          animate={isHovered ? { 
            borderColor: ["rgba(255,255,255,0)", "rgba(255,255,255,0.5)", "rgba(255,255,255,0)"],
          } : { borderColor: "rgba(255,255,255,0)" }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Particle System */}
        <ParticleSystem color={branch.particleColor} isActive={isHovered} />
      </div>
    </motion.div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, color }) => (
  <motion.div 
    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4"
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-white/60 text-sm">{title}</p>
        <p className="text-white font-bold text-lg">{value}</p>
      </div>
    </div>
  </motion.div>
);

// Main Component dengan Marketplace Style
export default function GameHub() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const { data: userData } = useUserData(playerName || "guest");

  // Initialize player
  useEffect(() => {
    const savedName = localStorage.getItem('gamehub_player_name');
    if (savedName) {
      setPlayerName(savedName);
      setShowNameInput(false);
    } else {
      setShowNameInput(true);
    }
  }, []);

  const savePlayerName = async (name) => {
    if (!name.trim()) return;
    
    setPlayerName(name.trim());
    localStorage.setItem('gamehub_player_name', name.trim());
    setShowNameInput(false);
    
    await userService.saveUserData(name.trim(), {
      nama: name.trim(),
      money: 1000,
      achievements: []
    });
  };

  // Marketplace-style header
  const marketplaceHeader = (
    <motion.div 
      className="text-center mb-8 z-10"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h1 
        className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        🎮 Game Marketplace
      </motion.h1>
      <p className="text-xl text-white/70 mb-6">
        Temukan game favoritmu dan menangkan hadiah besar!
      </p>
      
      {/* Stats Dashboard */}
      <div className="flex justify-center gap-4 mb-6">
        <StatsCard 
          title="Total Games" 
          value={branches.length} 
          icon="🎮" 
          color="bg-purple-500/20"
        />
        <StatsCard 
          title="Your Balance" 
          value={`Rp ${userData?.money?.toLocaleString() || '0'}`} 
          icon="💰" 
          color="bg-green-500/20"
        />
        <StatsCard 
          title="Players Online" 
          value="1,234" 
          icon="👥" 
          color="bg-blue-500/20"
        />
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Compact Name Input untuk Mobile */}
      <CompactNameInput onSave={savePlayerName} />

      {/* Header dengan Marketplace Style */}
      {playerName && marketplaceHeader}

      {/* Game Grid - Marketplace Style */}
      {playerName && (
        <motion.div 
          className="w-full max-w-7xl z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Filter/Category Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <span className="text-white font-semibold">Kategori:</span>
              <div className="flex gap-2">
                {['All', 'Strategy', 'Puzzle', 'Luck'].map((cat) => (
                  <button
                    key={cat}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-white/60 text-sm">
              {branches.length} game tersedia
            </div>
          </div>

          {/* Game Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {branches.map((branch, i) => (
              <GameCard
                key={branch.path}
                branch={branch}
                index={i}
                onClick={() => navigate(branch.path)}
                isActive={false}
              />
            ))}
          </div>

          {/* Featured Section */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">✨ Featured Games</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl mb-4">🏆</div>
                <h4 className="text-white font-semibold mb-2">Turnamen Mingguan</h4>
                <p className="text-white/60 text-sm">Ikuti turnamen dan menangkan hadiah besar!</p>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl mb-4">🎁</div>
                <h4 className="text-white font-semibold mb-2">Daily Rewards</h4>
                <p className="text-white/60 text-sm">Login setiap hari untuk bonus menarik!</p>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl mb-4">👥</div>
                <h4 className="text-white font-semibold mb-2">Referral Program</h4>
                <p className="text-white/60 text-sm">Undang teman dan dapatkan bonus!</p>
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

