import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../firebase";
import { ref, get, set, push } from "firebase/database";

const wheelSegments = [
  { label: "100", color: "#FF6B6B", probability: 15 },
  { label: "200", color: "#4ECDC4", probability: 12 },
  { label: "50", color: "#45B7D1", probability: 20 },
  { label: "500", color: "#96CEB4", probability: 5 },
  { label: "0", color: "#FFEAA7", probability: 25 },
  { label: "1000", color: "#DDA0DD", probability: 3 },
  { label: "150", color: "#98D8C8", probability: 10 },
  { label: "JACKPOT", color: "#FFD700", probability: 1 },
  { label: "75", color: "#F7DC6F", probability: 9 }
];

export default function LuckyWheel() {
  const navigate = useNavigate();
  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [money, setMoney] = useState(1000);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Firebase references
  const MONEY_REF = ref(db, 'globalMoney');
  const TRANSACTIONS_REF = ref(db, 'transactions');

  useEffect(() => {
    loadMoney();
  }, []);

  const loadMoney = async () => {
    try {
      const snapshot = await get(MONEY_REF);
      if (snapshot.exists()) {
        setMoney(snapshot.val());
      }
    } catch (error) {
      console.error("Error loading money:", error);
      const localMoney = parseInt(localStorage.getItem('globalMoney') || '1000');
      setMoney(localMoney);
    }
  };

  const updateMoney = async (newAmount, transactionType, amount) => {
    try {
      await set(MONEY_REF, newAmount);
      
      const transaction = {
        type: transactionType,
        amount: amount,
        newBalance: newAmount,
        timestamp: Date.now(),
        game: 'LuckyWheel'
      };
      
      await push(TRANSACTIONS_REF, transaction);
      setMoney(newAmount);
    } catch (error) {
      console.error("Error updating money:", error);
      localStorage.setItem('globalMoney', String(newAmount));
      setMoney(newAmount);
    }
  };

  const getWeightedRandomSegment = () => {
    const totalProbability = wheelSegments.reduce((sum, segment) => sum + segment.probability, 0);
    let random = Math.random() * totalProbability;
    
    for (const segment of wheelSegments) {
      random -= segment.probability;
      if (random <= 0) {
        return segment;
      }
    }
    return wheelSegments[0];
  };

  const spin = async () => {
    if (bet <= 0 || bet > money) {
      alert("Bet tidak valid! Pastikan saldo cukup.");
      return;
    }

    setSpinning(true);
    setShowResult(false);

    // Get random segment based on probability
    const selectedSegment = getWeightedRandomSegment();
    const segmentIndex = wheelSegments.findIndex(s => s.label === selectedSegment.label);
    
    // Calculate rotation
    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const finalRotation = rotation + (spins * 360) - (segmentIndex * (360 / wheelSegments.length));
    
    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      
      let moneyChange = 0;
      let resultText = "";
      
      if (selectedSegment.label === "JACKPOT") {
        moneyChange = bet * 10;
        resultText = `🎉 JACKPOT! Menang ${moneyChange}!`;
        updateMoney(money + moneyChange, 'jackpot', moneyChange);
      } else if (selectedSegment.label === "0") {
        moneyChange = -bet;
        resultText = "😞 Kalah taruhan";
        updateMoney(money - bet, 'lose', -bet);
      } else {
        moneyChange = parseInt(selectedSegment.label);
        resultText = `🎉 Menang Rp ${moneyChange}!`;
        updateMoney(money + moneyChange, 'win', moneyChange);
      }

      setResult({
        segment: selectedSegment,
        moneyChange: moneyChange,
        text: resultText
      });
      
      setShowResult(true);
    }, 3000);
  };

  const resetMoney = async () => {
    if (confirm("Reset saldo ke 1000?")) {
      await updateMoney(1000, 'reset', 0);
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
          Lucky Wheel
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

      {/* Wheel Container */}
      <motion.div 
        className="relative mb-8 z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Wheel Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-yellow-400 z-20"></div>
        
        {/* Wheel */}
        <motion.div 
          className="relative w-80 h-80 rounded-full border-8 border-white/20 shadow-2xl overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ 
            duration: spinning ? 3 : 0, 
            ease: spinning ? "easeOut" : "linear",
            type: "spring",
            stiffness: 100
          }}
        >
          {wheelSegments.map((segment, index) => {
            const angle = 360 / wheelSegments.length;
            const rotation = index * angle;
            
            return (
              <div
                key={segment.label}
                className="absolute w-full h-full"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((angle * Math.PI) / 180)}% ${50 - 50 * Math.cos((angle * Math.PI) / 180)}%)`
                }}
              >
                <div 
                  className="w-full h-full flex items-start justify-center pt-8"
                  style={{ backgroundColor: segment.color }}
                >
                  <span className="text-white font-bold text-sm transform -rotate-90">
                    {segment.label}
                  </span>
                </div>
              </div>
            );
          })}
          
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-slate-800 rounded-full border-4 border-white/30 flex items-center justify-center">
            <span className="text-white font-bold">🎯</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bet Input */}
      <motion.div 
        className="max-w-md w-full glass-lonjong rounded-3xl p-6 mb-6 z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
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
              className="w-12 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs hover:bg-white/20 transition-colors"
              disabled={spinning}
            >
              +10
            </button>
            <button 
              onClick={() => setBet(Math.min(money, bet + 100))}
              className="w-12 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs hover:bg-white/20 transition-colors"
              disabled={spinning}
            >
              +100
            </button>
          </div>
        </div>

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
            "🎡 Putar Wheel"
          )}
        </motion.button>
      </motion.div>

      {/* Result Display */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div 
            className="max-w-md w-full glass-lonjong rounded-3xl p-6 mb-6 z-10"
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
          >
            <div className="text-center">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                {result.segment.label === "JACKPOT" ? "🎉" : "🎯"}
              </motion.div>
              <h3 
                className={`text-2xl font-bold mb-2 ${
                  result.moneyChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {result.text}
              </h3>
              <p className="text-white/60">
                Hasil: <span style={{ color: result.segment.color }}>{result.segment.label}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules */}
      <motion.div 
        className="max-w-md w-full glass-lonjong rounded-2xl p-6 text-white/80 text-sm z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h3 className="font-semibold mb-3 text-white flex items-center gap-2">
          📋 Aturan Main
        </h3>
        <ul className="list-disc list-inside space-y-2">
          <li>Setiap segmemiliki probabilitas berbeda</li>
          <li>JACKPOT = 10x taruhan (probabilitas 1%)</li>
          <li>0 = kalah taruhan</li>
          <li>Nomor lain = menang sesuai nominal</li>
          <li>Saldo global berlaku untuk semua pemain</li>
        </ul>
      </motion.div>

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
