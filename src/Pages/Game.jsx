import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUserData } from '../hooks/useFirebaseData';
import { userService } from '../service/firebaseService';

// 🎮 Enhanced Game Selection with Thumbnail Focus
const Game = () => {
  const navigate = useNavigate();
  const { userData } = useUserData();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState({});

  // Enhanced game list with proper thumbnails - PATH TETAP SAMA
  const branches = [
    // PATH SAMA SEPERTI SEBELUMNYA ✓
    {
      label: "FishIt",
      path: "/game/fishing",  // ← PATH TETAP SAMA
      color: "from-blue-500 to-cyan-500",
      description: "Gas berburu secret treasure di lautan! 🎣",
      icon: "🐟",
      particleColor: "#8CE4FF",
      thumbnail: "/thumbnails/fishit.jpg",
      category: "Arcade",
      difficulty: "Easy",
      isNew: true,
      players: "1 Player",
      duration: "5-10 min"
    },
    {
      label: "Dino Runner",
      path: "/game/dino",  // ← PATH TETAP SAMA
      color: "from-green-400 to-blue-500",
      description: "Request dari RheRhe 🦕",
      icon: "🦕",
      particleColor: "#8BAE66",
      thumbnail: "/thumbnails/dino.jpg",
      category: "Action",
      difficulty: "Medium",
      isNew: false,
      players: "1 Player",
      duration: "3-5 min"
    },
    {
      label: "Snake Game",
      path: "/game/snake",  // ← PATH TETAP SAMA
      color: "from-green-500 to-cyan-500",
      description: "Ular kadut",
      icon: "🐍",
      particleColor: "#43AD26",
      thumbnail: "/thumbnails/snake.jpg",
      category: "Arcade",
      difficulty: "Easy",
      isNew: true,
      players: "1 Player",
      duration: "5-10 min"
    },
    {
      label: "Space Shooter",
      path: "/game/spaceshoot",  // ← PATH TETAP SAMA
      color: "from-purple-500 to-black-500",
      description: "Dor Dor",
      icon: "💥",
      particleColor: "#360185",
      thumbnail: "/thumbnails/spaceshot.jpg",
      category: "Arcade",
      difficulty: "Easy",
      isNew: true,
      players: "1 Player",
      duration: "5-10 min"
    },
    {
      label: "BlockBlast",
      path: "/game/blockblast",  // ← PATH TETAP SAMA
      color: "from-purple-400 to-pink-500",
      description: "Susun blok untuk mencetak poin tertinggi! 🧩",
      icon: "🧩",
      particleColor: "#E83C91",
      thumbnail: "/thumbnails/blockblast.jpg",
      category: "Puzzle",
      difficulty: "Easy",
      isNew: false,
      players: "1 Player",
      duration: "5-15 min"
    },
    {
      label: "Game Reme",
      path: "/game/reme",  // ← PATH TETAP SAMA
      color: "from-purple-500 to-indigo-500",
      description: "Tebak angka dengan multiplier menarik! 🎲",
      icon: "🎲",
      particleColor: "#8B5CF6",
      thumbnail: "/thumbnails/gamereme.jpg",
      category: "Casino",
      difficulty: "Medium",
      isNew: false,
      players: "1 Player",
      duration: "2-5 min"
    },
    {
      label: "Lucky Wheel",
      path: "/game/luckywheel",  // ← PATH TETAP SAMA
      color: "from-yellow-400 to-orange-500",
      description: "Putar roda keberuntunganmu! 🎡",
      icon: "🎡",
      particleColor: "#FFD700",
      thumbnail: "/thumbnails/luckywheel.jpg",
      category: "Casino",
      difficulty: "Easy",
      isNew: false,
      players: "1 Player",
      duration: "1-3 min"
    },
    {
      label: "Mines",
      path: "/game/mines",  // ← PATH TETAP SAMA
      color: "from-cyan-500 to-blue-500",
      description: "Hindari bom dan temukan harta karun! 💎",
      icon: "💎",
      particleColor: "#06B6D4",
      thumbnail: "/thumbnails/mines.jpg",
      category: "Puzzle",
      difficulty: "Hard",
      isNew: false,
      players: "1 Player",
      duration: "3-10 min"
    },
    {
      label: "Memory Card",
      path: "/game/memory",  // ← PATH TETAP SAMA
      color: "from-indigo-400 to-purple-500",
      description: "Tes ingatan dengan kartu karakter kelas! 🧠",
      icon: "🧠",
      particleColor: "#6366F1",
      thumbnail: "/thumbnails/memory.jpg",
      category: "Memory",
      difficulty: "Medium",
      isNew: true,
      players: "1 Player",
      duration: "5-15 min"
    },
    {
      label: "Quiz Challenge",
      path: "/game/quiz",  // ← PATH TETAP SAMA
      color: "from-green-400 to-emerald-500",
      description: "Tantang pengetahuanmu dengan quiz seru! 🎯",
      icon: "🎯",
      particleColor: "#10B981",
      thumbnail: "/thumbnails/quiz.jpg",
      category: "Education",
      difficulty: "Hard",
      isNew: true,
      players: "1 Player",
      duration: "10-20 min"
    },
    {
      label: "Tower Defense",
      path: "/game/towerdefense",  // ← PATH TETAP SAMA
      color: "from-red-400 to-orange-500",
      description: "Defend kelas dari serangan tugas dan PR! 🏰",
      icon: "🏰",
      particleColor: "#EF4444",
      thumbnail: "/thumbnails/towerdefense.jpg",
      category: "Strategy",
      difficulty: "Hard",
      isNew: true,
      players: "1 Player",
      duration: "15-30 min"
    }
  ];

  const categories = ['all', 'Arcade', 'Action', 'Puzzle', 'Casino', 'Memory', 'Education', 'Strategy'];

  // Filter games based on category and search
  const filteredGames = branches.filter(game => {
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    const matchesSearch = game.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const navigateToGame = (path, gameLabel) => {
    setLoading(prev => ({ ...prev, [gameLabel]: true }));
    
    // Simulate loading time for better UX
    setTimeout(() => {
      navigate(path);
    }, 500);
  };

  const getGameStats = (gameLabel) => {
    const stats = userData?.gameStats?.[gameLabel.toLowerCase().replace(' ', '')];
    return stats || { gamesPlayed: 0, highScore: 0 };
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Arcade': return 'bg-blue-500';
      case 'Action': return 'bg-green-500';
      case 'Puzzle': return 'bg-purple-500';
      case 'Casino': return 'bg-yellow-500';
      case 'Memory': return 'bg-indigo-500';
      case 'Education': return 'bg-emerald-500';
      case 'Strategy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            🎮 XE-4 Gaming Portal
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Pilih game favoritmu dan tantang teman-teman kelas!
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-6">
            <input
              type="text"
              placeholder="Cari game..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-black/30 backdrop-blur-lg text-white placeholder-gray-400 border border-gray-600 focus:border-purple-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-black/30 text-gray-300 hover:bg-black/50'
                }`}
              >
                {category === 'all' ? 'Semua' : category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Game Grid dengan Thumbnail Focus */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredGames.map((branch, index) => {
              const stats = getGameStats(branch.label);
              
              return (
                <motion.div
                  key={branch.label}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="relative"
                >
                  {/* New Game Badge */}
                  {branch.isNew && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <span className="bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                        NEW!
                      </span>
                    </div>
                  )}

                  {/* Game Card dengan Thumbnail Focus */}
                  <div
                    className={`bg-gradient-to-br ${branch.color} p-1 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105`}
                    onClick={() => navigateToGame(branch.path, branch.label)}
                  >
                    <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 h-full flex flex-col">
                      
                      {/* Thumbnail Section - FOKUS DISINI */}
                      <div className="relative mb-4 h-32 rounded-xl overflow-hidden">
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${branch.color} opacity-60`}></div>
                        
                        {/* Thumbnail Image */}
                        <div className="relative w-full h-full flex items-center justify-center">
                          {branch.thumbnail ? (
                            <img 
                              src={branch.thumbnail} 
                              alt={branch.label}
                              className="w-full h-full object-cover rounded-xl opacity-80 hover:opacity-100 transition-opacity duration-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          
                          {/* Fallback - Icon sebagai Thumbnail */}
                          <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-60">
                            {branch.icon}
                          </div>
                        </div>
                        
                        {/* Overlay untuk nama game */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <h3 className="text-white font-bold text-lg">{branch.label}</h3>
                        </div>
                      </div>

                      {/* Game Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(branch.category)} text-white`}>
                            {branch.category}
                          </span>
                          <span className={`text-sm font-semibold ${getDifficultyColor(branch.difficulty)}`}>
                            {branch.difficulty}
                          </span>
                        </div>
                        
                        <p className="text-gray-300 text-sm">
                          {branch.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>👥 {branch.players}</span>
                          <span>⏱️ {branch.duration}</span>
                        </div>
                      </div>

                      {/* User Stats */}
                      {userData && (
                        <div className="bg-black/30 rounded-lg p-3 mb-4">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-center">
                              <span className="text-purple-400 font-semibold">{stats.gamesPlayed}</span>
                              <div className="text-gray-400">Played</div>
                            </div>
                            <div className="text-center">
                              <span className="text-yellow-400 font-semibold">{stats.highScore}</span>
                              <div className="text-gray-400">High Score</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Play Button */}
                      <button
                        disabled={loading[branch.label]}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                          loading[branch.label]
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-white/20 hover:bg-white/30 text-white transform hover:scale-105'
                        }`}
                      >
                        {loading[branch.label] ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Loading...
                          </div>
                        ) : (
                          '▶️ Mainkan'
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* No Results */}
        {filteredGames.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">Game tidak ditemukan</h3>
            <p className="text-gray-400">Coba cari dengan kata kunci lain atau pilih kategori berbeda</p>
          </motion.div>
        )}

        {/* Back Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/')}
            className="bg-black/30 backdrop-blur-lg text-white px-8 py-3 rounded-lg font-semibold hover:bg-black/50 transition-all duration-200 transform hover:scale-105"
          >
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
};

export default Game;

