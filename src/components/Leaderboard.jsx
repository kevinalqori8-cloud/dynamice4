import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { userService } from "../service/firebaseService";
import { daftarSiswa } from "../data/siswa";

export default function Leaderboard() {
  const nav = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, rich, games, achievements
  const [currentUser, setCurrentUser] = useState(null);

  // Load current user dan leaderboard data
  useEffect(() => {
    loadLeaderboardData();
    loadCurrentUser();
  }, [filter]);

  const loadCurrentUser = () => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  };

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Ambil semua user data dari Firebase
      const allUsers = await userService.getAllUsers();
      
      // Filter dan sorting berdasarkan tipe
      let sortedUsers = [];
      
      switch(filter) {
        case "rich":
          // Sort by money (terkaya)
          sortedUsers = allUsers.sort((a, b) => (b.money || 0) - (a.money || 0));
          break;
        case "games":
          // Sort by total games played
          sortedUsers = allUsers.sort((a, b) => {
            const aGames = a.totalGames || 0;
            const bGames = b.totalGames || 0;
            return bGames - aGames;
          });
          break;
        case "achievements":
          // Sort by achievements count
          sortedUsers = allUsers.sort((a, b) => {
            const aAch = a.achievements?.length || 0;
            const bAch = b.achievements?.length || 0;
            return bAch - aAch;
          });
          break;
        default:
          // All - sort by level (pengalaman)
          sortedUsers = allUsers.sort((a, b) => {
            const aLevel = calculateLevel(a);
            const bLevel = calculateLevel(b);
            return bLevel - aLevel;
          });
      }
      
      setUsers(sortedUsers);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLevel = (user) => {
    const achievements = user.achievements?.length || 0;
    const money = user.money || 0;
    const gamesPlayed = user.totalGames || 0;
    
    // Formula level: achievements * 2 + money/1000 + gamesPlayed * 0.5
    return Math.floor(achievements * 2 + money / 1000 + gamesPlayed * 0.5);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "from-yellow-400 to-yellow-600";
    if (rank === 2) return "from-gray-300 to-gray-500";
    if (rank === 3) return "from-amber-600 to-amber-800";
    return "from-purple-500 to-pink-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <motion.header 
        className="flex items-center gap-4 p-6 z-10 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
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
          🏆 Leaderboard
        </h1>
      </motion.header>

      {/* Filter Buttons */}
      <motion.div 
        className="flex justify-center gap-3 px-6 mb-8 z-10 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {[
          { key: "all", label: "Level", icon: "⭐" },
          { key: "rich", label: "Kekayaan", icon: "💰" },
          { key: "games", label: "Games", icon: "🎮" },
          { key: "achievements", label: "Achievements", icon: "🏅" }
        ].map((item) => (
          <motion.button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === item.key 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="mr-1">{item.icon}</span>
            {item.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Current User Position */}
      {currentUser && (
        <motion.div 
          className="mx-6 mb-6 z-10 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-4">
            <h3 className="text-lg font-semibold mb-2">📍 Posisi Kamu</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-lg font-bold">
                  {currentUser.nama.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{currentUser.nama}</p>
                  <p className="text-sm text-white/60">
                    Level {calculateLevel(currentUser)} • Rp {(currentUser.money || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  #{users.findIndex(u => u.nama === currentUser.nama) + 1}
                </p>
                <p className="text-sm text-white/60">dari {users.length}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard List */}
      <motion.div 
        className="px-6 pb-10 z-10 relative"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence mode="wait">
            {users.map((user, index) => {
              const rank = index + 1;
              const level = calculateLevel(user);
              const isCurrentUser = currentUser?.nama === user.nama;
              
              return (
                <motion.div
                  key={user.nama}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`relative overflow-hidden rounded-2xl backdrop-blur-sm border ${
                    isCurrentUser 
                      ? 'border-purple-400/50 bg-gradient-to-r from-purple-500/20 to-pink-500/20' 
                      : 'border-white/20 bg-white/10'
                  } p-6`}
                >
                  {/* Rank Badge */}
                  <div className="absolute top-4 right-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getRankColor(rank)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {getRankIcon(rank)}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-2xl font-bold text-white">
                        {user.nama.charAt(0).toUpperCase()}
                      </div>
                      {rank <= 3 && (
                        <div className="absolute -bottom-1 -right-1 text-2xl">
                          {rank === 1 ? "👑" : rank === 2 ? "🥈" : "🥉"}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{user.nama}</h3>
                      <p className="text-white/60 text-sm">{user.jurusan || 'XE-4'}</p>
                      
                      {/* Stats */}
                      <div className="flex gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <span>⭐</span>
                          <span>Level {level}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>💰</span>
                          <span>Rp {(user.money || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🏅</span>
                          <span>{user.achievements?.length || 0}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full bg-gradient-to-r ${getRankColor(rank)} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (rank / users.length) * 100)}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* View Profile Button */}
                  <motion.button
                    onClick={() => nav(`/portfolio/${encodeURIComponent(user.nama)}`)}
                    className="mt-4 w-full bg-white/10 hover:bg-white/20 py-2 rounded-lg text-sm transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Lihat Portfolio
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {users.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">Belum ada data</h3>
              <p className="text-white/60">Main game untuk masuk leaderboard!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Background Animasi */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
}

