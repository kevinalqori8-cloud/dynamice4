import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUserData } from '../../hooks/useFirebaseData';
import { userService } from '../../service/firebaseService';

const WHEEL_SEGMENTS = [
  { label: "100", color: "#FF6B6B", probability: 15, type: "win" },
  { label: "200", color: "#4ECDC4", probability: 12, type: "win" },
  { label: "50", color: "#45B7D1", probability: 20, type: "win" },
  { label: "500", color: "#96CEB4", probability: 5, type: "win" },
  { label: "0", color: "#FFEAA7", probability: 25, type: "lose" },
  { label: "1000", color: "#DDA0DD", probability: 3, type: "jackpot" },
  { label: "150", color: "#98D8C8", probability: 10, type: "win" },
  { label: "JACKPOT", color: "#FFD700", probability: 1, type: "jackpot" },
  { label: "75", color: "#F7DC6F", probability: 9, type: "win" }
];

export default function LuckyWheel() {
  const navigate = useNavigate();
  
  // Player state
  const [playerName, setPlayerName] = useState("");
  const [bet, setBet] = useState(10);
  const [money, setMoneyState] = useState(1000);
  
  // Game state
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastSpins, setLastSpins] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Firebase integration
  const { data: userData, loading, updateMoney } = useUserData(playerName || "guest");
  const [transactions, setTransactions] = useState([]);

  // Initialize player
  useEffect(() => {
    const savedName = localStorage.getItem('luckywheel_player_name');
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

  // Load last spins
  useEffect(() => {
    const saved = localStorage.getItem('luckywheel_last_spins');
    if (saved) {
      setLastSpins(JSON.parse(saved));
    }
  }, []);

  // Utility functions
  const getWeightedRandomSegment = useCallback(() => {
    const totalProbability = WHEEL_SEGMENTS.reduce((sum, segment) => sum + segment.probability, 0);
    let random = Math.random() * totalProbability;
    
    for (const segment of WHEEL_SEGMENTS) {
      random -= segment.probability;
      if (random <= 0) {
        return segment;
      }
    }
    return WHEEL_SEGMENTS[0];
  }, []);

  const savePlayerName = async (name) => {
    if (!name.trim()) return;
    
    setPlayerName(name.trim());
    localStorage.setItem('luckywheel_player_name', name.trim());
    
    // Create user in Firebase if not exists
    await userService.saveUserData(name.trim(), {
      nama: name.trim(),
      money: 1000,
      achievements: []
    });
  };

  const saveLastSpin = (spinData) => {
    const updated = [spinData, ...lastSpins].slice(0, 10);
    setLastSpins(updated);
    localStorage.setItem('luckywheel_last_spins', JSON.stringify(updated));
  };

  const spin = async () => {
    if (bet <= 0 || bet > money) {
      setResult({
        segment: { label: "ERROR", color: "#FF0000" },
        moneyChange: 0,
        text: "❌ Bet tidak valid! Pastikan saldo cukup.",
        type: "error"
      });
      setShowResult(true);
      return;
    }
    
    setSpinning(true);
    setShowResult(false);

    // Get weighted random segment
    const selectedSegment = getWeightedRandomSegment();
    const segmentIndex = WHEEL_SEGMENTS.findIndex(s => s.label === selectedSegment.label);
    
    // Calculate rotation with easing
    const baseRotation = 360 * 5; // 5 full rotations minimum
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const targetAngle = segmentIndex * segmentAngle;
    const finalRotation = rotation + baseRotation + (360 - targetAngle) + (Math.random() * segmentAngle);
    
    setRotation(finalRotation);

    // Wait for animation to complete
    setTimeout(async () => {
      setSpinning(false);
      
      // Calculate money change
      let moneyChange = 0;
      let resultText = "";
      
      switch (selectedSegment.type) {
        case "jackpot":
          moneyChange = bet * (selectedSegment.label === "JACKPOT" ? 10 : parseInt(selectedSegment.label));
          resultText = `🎉 JACKPOT! Menang Rp ${moneyChange.toLocaleString()}!`;
          break;
        case "win":
          moneyChange = parseInt(selectedSegment.label);
          resultText = `🎉 Menang Rp ${moneyChange.toLocaleString()}!`;
          break;
        case "lose":
          moneyChange = -bet;
          resultText = "😞 Kalah taruhan";
          break;
        default:
          moneyChange = 0;
          resultText = "🤷 Hasil tidak dikenal";
      }

      // Update money via Firebase
      const newMoney = money + moneyChange;
      const updateResult = await updateMoney(newMoney);
      
      if (updateResult.success) {
        setMoneyState(newMoney);
        
        const spinResult = {
          segment: selectedSegment,
          moneyChange: moneyChange,
          text: resultText,
          type: selectedSegment.type,
          bet: bet,
          timestamp: Date.now()
        };
        
        setResult(spinResult);
        
        // Save transaction and history
        await userService.addTransaction(playerName, {
          game: "LuckyWheel",
          moneyChange: moneyChange,
          result: moneyChange > 0 ? "win" : "lose",
          segment: selectedSegment.label,
          bet: bet,
          timestamp: Date.now()
        });
        
        saveLastSpin(spinResult);
      } else {
        setResult({
          segment: { label: "ERROR", color: "#FF0000" },
          moneyChange: 0,
          text: "❌ Error updating money",
          type: "error"
        });
      }
      
      setShowResult(true);
    }, 3500); // Longer animation duration
  };

  const resetMoney = async () => {
    if (!confirm("Reset saldo ke 1000?")) return;
    
    const result = await updateMoney(1000);
    if (result.success) {
      setMoneyState(1000);
      localStorage.removeItem('luckywheel_last_spins');
      setLastSpins([]);
      setResult({
        segment: { label: "RESET", color: "#00FF00" },
        moneyChange: 0,
        text: "✅ Saldo direset ke 1000",
        type: "info"
      });
      setShowResult(true);
    } else {
      setResult({
        segment: { label: "ERROR", color: "#FF0000" },
        moneyChange: 0,
        text: "❌ Error reset saldo",
        type: "error"
      });
      setShowResult(true);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading Lucky Wheel...</p>
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
          Lucky Wheel
        </h1>
        <button 
          onClick={resetMoney} 
          className="ml-auto bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-lg text-sm text-white hover:bg-white/20 transition-all"
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
            <p className="text-white/70 text-lg">Saldo</p>
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
                duration: spinning ? 3.5 : 0, 
                ease: spinning ? [0.25, 0.1, 0.25, 1] : "linear",
                type: "spring",
                stiffness: 100
              }}
            >
              {WHEEL_SEGMENTS.map((segment, index) => {
                const angle = 360 / WHEEL_SEGMENTS.length;
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
            className="max-w-md w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 mb-6 z-10"
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
                className="w-full bg-white/10 placeholder-white/60 px-4 py-3 rounded-xl outline-none border border-white/20 text-white text-lg focus:border-purple-400 transition-colors"
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
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-4 transition-all duration-300"
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
                className="max-w-md w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 mb-6 z-10"
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

          {/* Last Spins History */}
          {lastSpins.length > 0 && (
            <motion.div 
              className="max-w-md w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Riwayat Putaran</h3>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  {showHistory ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
              
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {lastSpins.map((spin, i) => (
                        <motion.div 
                          key={i} 
                          className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: spin.segment.color }}
                            ></div>
                            <span className="text-sm">{spin.segment.label}</span>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${
                            spin.moneyChange > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                          }`}>
                            {spin.moneyChange > 0 ? `+${spin.moneyChange}` : spin.moneyChange}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Rules */}
          <motion.div 
            className="max-w-md w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-white/80 text-sm z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h3 className="font-semibold mb-3 text-white flex items-center gap-2">
              📋 Aturan Main
            </h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Setiap segmemiliki probabilitas berbeda</li>
              <li>JACKPOT = 10x taruhan (probabilitas 1%)</li>
              <li>0 = kalah taruhan</li>
              <li>Nomor lain = menang sesuai nominal</li>
              <li>Saldo tersimpan otomatis di cloud</li>
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
        </>
      )}
    </div>
  );
}

