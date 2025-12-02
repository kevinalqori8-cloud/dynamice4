import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../firebase";
import { ref, get, set, push } from "firebase/database";

export default function GameReme() {
  const navigate = useNavigate();
  const [bet, setBet] = useState(10);
  const [house, setHouse] = useState(0);
  const [player, setPlayer] = useState(0);
  const [status, setStatus] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [money, setMoney] = useState(1000);
  const [showRules, setShowRules] = useState(false);
  const [lastResults, setLastResults] = useState([]);
  
  const specialnum = [0, 28, 19];

  // Firebase money system
  const MONEY_REF = ref(db, 'globalMoney');
  const TRANSACTIONS_REF = ref(db, 'transactions');

  useEffect(() => {
    loadMoney();
    loadLastResults();
  }, []);

  const loadMoney = async () => {
    try {
      const snapshot = await get(MONEY_REF);
      if (snapshot.exists()) {
        setMoney(snapshot.val());
      } else {
        // Initialize global money
        await set(MONEY_REF, 1000);
        setMoney(1000);
      }
    } catch (error) {
      console.error("Error loading money:", error);
      // Fallback to localStorage
      const localMoney = parseInt(localStorage.getItem('globalMoney') || '1000');
      setMoney(localMoney);
    }
  };

  const loadLastResults = () => {
    const saved = localStorage.getItem('gameResults');
    if (saved) {
      setLastResults(JSON.parse(saved));
    }
  };

  const saveLastResult = (result) => {
    const updated = [result, ...lastResults].slice(0, 5);
    setLastResults(updated);
    localStorage.setItem('gameResults', JSON.stringify(updated));
  };

  const updateMoney = async (newAmount, transactionType, amount) => {
    try {
      await set(MONEY_REF, newAmount);
      
      // Log transaction
      const transaction = {
        type: transactionType,
        amount: amount,
        newBalance: newAmount,
        timestamp: Date.now(),
        game: 'GameReme'
      };
      
      await push(TRANSACTIONS_REF, transaction);
      setMoney(newAmount);
    } catch (error) {
      console.error("Error updating money:", error);
      // Fallback to localStorage
      localStorage.setItem('globalMoney', String(newAmount));
      setMoney(newAmount);
    }
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
      setHouse(Math.floor(Math.random() * 37));
      setPlayer(Math.floor(Math.random() * 37));
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      
      const h = Math.floor(Math.random() * 37);
      const p = Math.floor(Math.random() * 37);
      
      const hFinal = calcDigit(h);
      const pFinal = calcDigit(p);

      setHouse(hFinal);
      setPlayer(pFinal);

      // Calculate result
      let resultText = "";
      let moneyChange = 0;

      if (specialnum.includes(pFinal) && !specialnum.includes(hFinal)) {
        moneyChange = bet * 3;
        resultText = "🎉 Jackpot! Menang 3x!";
        updateMoney(money + bet * 3, 'win', bet * 3);
      } else if (pFinal > hFinal) {
        moneyChange = bet * 2;
        resultText = "🎉 Menang 2x!";
        updateMoney(money + bet * 2, 'win', bet * 2);
      } else if (pFinal === hFinal) {
        moneyChange = -bet;
        resultText = "😞 Seri - kalah taruhan";
        updateMoney(money - bet, 'lose', -bet);
      } else {
        moneyChange = -bet;
        resultText = "😞 Kalah";
        updateMoney(money - bet, 'lose', -bet);
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
              className={`w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg ${getColor(house)}`}
              animate={spinning ? { rotate: [0, 360] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {spinning ? "🌀" : house}
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
              className={`w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg ${getColor(player)}`}
              animate={spinning ? { rotate: [0, -360] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {spinning ? "🌀" : player}
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
          className="w-full glass-button py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
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
            <h3 className="font-semibold mb-3 text-white">📋 Aturan Lengkap</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Angka 0-36 → jumlah digit</li>
              <li>Jika masih 2 digit → ambil digit terakhir</li>
              <li>Anda lebih besar dari House → menang 2x taruhan</li>
              <li>Anda = 0 & bukan seri → menang 3x taruhan (Jackpot!)</li>
              <li>Seri atau kalah → taruhan hilang</li>
              <li>Saldo global berlaku untuk semua pemain</li>
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
    </div>
  );
}
