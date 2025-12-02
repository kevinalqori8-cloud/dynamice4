import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUserData } from '../../hooks/useFirebaseData';
import { userService } from '../../service/firebaseService';

const GRID_SIZE = 5;
const TOTAL_BOXES = GRID_SIZE * GRID_SIZE;
const specialnum = [0, 28, 19]; // Jackpot numbers

export default function GameReme() {
  const navigate = useNavigate();
  
  // Player state
  const [playerName, setPlayerName] = useState("");
  const [bet, setBet] = useState(10);
  const [money, setMoneyState] = useState(1000);
  
  // Game state
  const [houseNumber, setHouseNumber] = useState(0);
  const [playerNumber, setPlayerNumber] = useState(0);
  const [houseDigit, setHouseDigit] = useState(0);
  const [playerDigit, setPlayerDigit] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [status, setStatus] = useState("");
  const [lastResults, setLastResults] = useState([]);
  const [showRules, setShowRules] = useState(false);

  // Firebase integration - HAPUS yang lama, keep yang ini
  // Hapus loading dari useUserData, gunakan error handling
const { data: userData, error, updateMoney } = useUserData(playerName || "guest");

// Loading state yang lebih cerdas
if (error) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-center">
        <h2 className="text-xl font-bold mb-4">❌ Error Loading Game</h2>
        <p className="text-white/70 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg"
        >
          Reload Game
        </button>
      </div>
    </div>
  );
}

// Jika belum login, tampilkan input nama
if (!playerName) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <motion.div 
        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6"
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
    </div>
  );
}

// Jika data belum ada, tampilkan loading sementara
if (!userData) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading player data...</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

  const [transactions, setTransactions] = useState([]);

  // Initialize player
  useEffect(() => {
    const savedName = localStorage.getItem('reme_player_name');
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  // Sync with Firebase
  useEffect(() => {
    if (userData?.money !== undefined) {
      setMoneyState(userData.money);
    }
  }, [userData]);

  // Load last results
  useEffect(() => {
    const saved = localStorage.getItem('gameResults');
    if (saved) {
      setLastResults(JSON.parse(saved));
    }
  }, []);

  const savePlayerName = async (name) => {
    if (!name.trim()) return;
    
    setPlayerName(name.trim());
    localStorage.setItem('reme_player_name', name.trim());
    
    // Create user in Firebase if not exists
    await userService.saveUserData(name.trim(), {
      nama: name.trim(),
      money: 1000,
      achievements: []
    });
  };

  const saveLastResult = (result) => {
    const updated = [result, ...lastResults].slice(0, 5);
    setLastResults(updated);
    localStorage.setItem('gameResults', JSON.stringify(updated));
  };

  // Game logic
  const getColor = (n) => {
    if (n === 0) return "bg-green-500";
    return n % 2 === 0 ? "bg-white text-black" : "bg-red-500";
  };

  const calcDigit = (n) => {
    let sum = String(n).split("").reduce((a, b) => Number(a) + Number(b), 0);
    if (sum > 9) sum = Number(String(sum).slice(-1));
    return sum;
  };

  const spin = async () => {
    if (bet <= 0 || bet > money) {
      alert("Bet tidak valid! Pastikan saldo cukup.");
      return;
    }
    
    setSpinning(true);
    setStatus("");

    // Animation sequence
    const spinInterval = setInterval(() => {
      setHouseNumber(Math.floor(Math.random() * 37));
      setPlayerNumber(Math.floor(Math.random() * 37));
    }, 100);

    setTimeout(async () => {
      clearInterval(spinInterval);
      
      const h = Math.floor(Math.random() * 37);
      const p = Math.floor(Math.random() * 37);
      
      const hFinal = calcDigit(h);
      const pFinal = calcDigit(p);

      setHouseNumber(hFinal);
      setPlayerNumber(pFinal);

      // Calculate result
      let resultText = "";
      let moneyChange = 0;

      if (specialnum.includes(pFinal) && !specialnum.includes(hFinal)) {
        moneyChange = bet * 3;
        resultText = "🎉 Jackpot! Menang 3x!";
        await updateMoney(money + bet * 3, 'win', bet * 3);
      } else if (pFinal > hFinal) {
        moneyChange = bet * 2;
        resultText = "🎉 Menang 2x!";
        await updateMoney(money + bet * 2, 'win', bet * 2);
      } else if (pFinal === hFinal) {
        moneyChange = -bet;
        resultText = "😞 Seri - kalah taruhan";
        await updateMoney(money - bet, 'lose', -bet);
      } else {
        moneyChange = -bet;
        resultText = "😞 Kalah";
        await updateMoney(money - bet, 'lose', -bet);
      }

      setStatus(resultText);
      saveLastResult({
        player: pFinal,
        house: hFinal,
        result: resultText,
        moneyChange: moneyChange,
        timestamp: Date.now()
      });
      
      setSpinning(false);
    }, 2000);
  };

  const resetMoney = async () => {
    if (confirm("Reset saldo ke 1000?")) {
      await updateMoney(1000, 'reset', 0);
      localStorage.removeItem('gameResults');
      setLastResults([]);
      alert("Saldo direset!");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading GameReme...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <motion.header 
        className="flex items-center gap-4 p-6 w-full max-w-4xl z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
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
          Game Reme
        </h1>
        <button 
          onClick={resetMoney} 
          className="ml-auto glass-button px-4 py-2 rounded-lg text-sm hover:bg-white/20 transition-all"
        >
          Reset Saldo
        </button>
      </motion.header>

      {/* Player Name Input */}
      {!playerName && (
        <motion.div 
          className="mb-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h3 className="text-white text-center mb-3">Masukkan Nama Anda</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nama Anda"
              className="bg-white/10 placeholder-white/60 px-3 py-2 rounded-lg outline-none border border-white/20 text-white"
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
              className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg text-white"
            >
              Simpan
            </button>
          </div>
        </motion.div>
      )}

      {playerName && (
        <>
          {/* Money Display */}
          <motion.div 
            className="mb-8 text-center z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-white/70 text-lg">Saldo Global</p>
            <motion.p 
              className="text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text"
              key={money}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              Rp {money.toLocaleString()}
            </motion.p>
          </motion.div>

          {/* Game Board */}
          <motion.div 
            className="max-w-md w-full glass-lonjong rounded-3xl p-8 mb-6 z-10"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Bet Input */}
            <div className="mb-6">
              <label className="text-white/70 text-sm font-medium block mb-2">Taruhan (Rp)</label>
              <div className="relative">
                <input
                  type="number"
                  value={bet}
                  onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white/10 backdrop-blur-sm placeholder-white/60 px-4 py-3 rounded-xl outline-none border border-white/20 text-white text-lg focus:border-purple-400 transition-colors"
                  min="1"
                  max={money}
                  disabled={spinning}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                  <button 
                    onClick={() => setBet(Math.min(money, bet + 10))}
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs hover:bg-white/20 transition-colors"
                    disabled={spinning}
                  >
                    +10
                  </button>
                  <button 
                    onClick={() => setBet(Math.min(money, bet + 100))}
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs hover:bg-white/20 transition-colors"
                    disabled={spinning}
                  >
                    +100
                  </button>
                </div>
              </div>
            </div>

            {/* Game Display */}
            <div className="flex items-center justify-between mb-6">
              <motion.div 
                className="text-center"
                animate={spinning ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <p className="text-white/70 text-sm mb-2">House</p>
                <motion.div 
                  className={`w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg ${getColor(houseNumber)}`}
                  animate={spinning ? { rotate: [0, 360] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {spinning ? "🌀" : houseNumber}
                </motion.div>
              </motion.div>

              <div className="text-center">
                <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                <p className="text-white/50 text-xs mt-2">VS</p>
              </div>

              <motion.div 
                className="text-center"
                animate={spinning ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <p className="text-white/70 text-sm mb-2">Anda</p>
                <motion.div 
                  className={`w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg ${getColor(playerNumber)}`}
                  animate={spinning ? { rotate: [0, -360] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {spinning ? "🌀" : playerNumber}
                </motion.div>
              </motion.div>
            </div>

            {/* Status */}
            <AnimatePresence>
              {status && (
                <motion.div 
                  className="text-center mb-6 p-3 rounded-xl bg-white/10 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <p className="text-lg font-semibold">{status}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Spin Button */}
            <motion.button
              onClick={spin}
              disabled={spinning || bet <= 0 || bet > money}
              className="w-full glass-button py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg mt-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {spinning ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    🌀
                  </motion.span>
                  Memutar...
                </span>
              ) : (
                "🎲 Putar Roda"
              )}
            </motion.button>
          </motion.div>

          {/* Last Results */}
          {lastResults.length > 0 && (
            <motion.div 
              className="max-w-md w-full glass-lonjong rounded-2xl p-6 mb-6 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="font-semibold mb-4 text-white">Hasil Terakhir</h3>
              <div className="space-y-2">
                {lastResults.map((result, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🏠{result.house} vs 🎯{result.player}</span>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${result.moneyChange > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      {result.moneyChange > 0 ? `+${result.moneyChange}` : result.moneyChange}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Rules Toggle */}
          <motion.button
            onClick={() => setShowRules(!showRules)}
            className="text-white/60 hover:text-white transition-colors z-10 mb-4"
          >
            {showRules ? "📖 Sembunyikan Aturan" : "📖 Tampilkan Aturan"}
          </motion.button>

          {/* Rules */}
          <AnimatePresence>
            {showRules && (
              <motion.div 
                className="max-w-md w-full glass-lonjong rounded-2xl p-6 text-white/80 text-sm z-10"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h3 className="font-semibold mb-3 text-white">📋 Aturan Singkat</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Angka 0-36 → jumlah digit</li>
                  <li>Jika masih 2 digit → ambil digit terakhir</li>
                  <li>Anda lebih besar dari House → menang 2x taruhan</li>
                  <li>Anda = 0 & bukan seri → menang 3x taruhan (Jackpot!)</li>
                  <li>Seri atau kalah → taruhan hilang</li>
                  <li>Saldo tersimpan otomatis di cloud</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom CSS */}
          <style jsx>{`
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
        </>
      )}
    </div>
  );
}

