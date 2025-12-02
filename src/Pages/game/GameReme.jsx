import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../service/firebaseService';
import { useUserData } from '../../hooks/useFirebaseData';

const WHEEL_SEGMENTS = 37; // 0-36
const JACKPOT_NUMBERS = [0, 28, 19]; // Special numbers for 3x win

export default function GameReme() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [lastResults, setLastResults] = useState([]);
  const [showRules, setShowRules] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Firebase integration
  const { data: userData, updateMoney } = useUserData(playerName || "guest");

  // Auto-login dari Auth Context
  useEffect(() => {
    if (user) {
      setPlayerName(user.nama);
    } else {
      const savedName = localStorage.getItem('reme_player_name');
      if (savedName) {
        setPlayerName(savedName);
      }
    }
  }, [user]);

  // Sync money dengan Firebase
  useEffect(() => {
    if (userData?.money !== undefined) {
      setMoneyState(userData.money);
    }
  }, [userData]);

  // Load last results
  useEffect(() => {
    const saved = localStorage.getItem('reme_last_results');
    if (saved) {
      setLastResults(JSON.parse(saved));
    }
  }, []);

  // Digit calculation
  const calcDigit = (n) => {
    let sum = String(n).split("").reduce((a, b) => Number(a) + Number(b), 0);
    if (sum > 9) sum = Number(String(sum).slice(-1));
    return sum;
  };

  // Calculate rotation for wheel
  const calculateRotation = (targetNumber) => {
    const segmentAngle = 360 / 37;
    const targetAngle = targetNumber * segmentAngle;
    const spins = 5 + Math.random() * 3; // 5-8 full rotations
    return rotation + (spins * 360) + (360 - targetAngle);
  };

  const savePlayerName = async (name) => {
    if (!name.trim()) return;
    
    setPlayerName(name.trim());
    localStorage.setItem('reme_player_name', name.trim());
    
    // Create user in Firebase
    await userService.saveUserData(name.trim(), {
      nama: name.trim(),
      money: 1000,
      achievements: []
    });
  };

  const saveLastResult = (result) => {
    const updated = [result, ...lastResults].slice(0, 10);
    setLastResults(updated);
    localStorage.setItem('reme_last_results', JSON.stringify(updated));
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

    // Get weighted random result (similar to casino logic)
    const random = Math.random();
    let targetNumber;
    
    // Weighted probability (similar to LuckyWheel)
    if (random < 0.05) targetNumber = JACKPOT_NUMBERS[Math.floor(Math.random() * JACKPOT_NUMBERS.length)];
    else if (random < 0.3) targetNumber = Math.floor(Math.random() * 10) + 20; // Higher numbers (better chance)
    else if (random < 0.6) targetNumber = Math.floor(Math.random() * 10) + 10; // Medium numbers
    else targetNumber = Math.floor(Math.random() * 10); // Lower numbers

    const finalRotation = calculateRotation(targetNumber);
    setRotation(finalRotation);

    setTimeout(async () => {
      setSpinning(false);
      
      const hNum = targetNumber;
      const pNum = Math.floor(Math.random() * 37);
      
      const hFinal = calcDigit(hNum);
      const pFinal = calcDigit(pNum);

      setHouseNumber(hNum);
      setPlayerNumber(pNum);
      setHouseDigit(hFinal);
      setPlayerDigit(pFinal);

      // Calculate result with multiplier
      let resultText = "";
      let moneyChange = 0;
      let multiplier = 1;

      if (JACKPOT_NUMBERS.includes(pFinal) && !JACKPOT_NUMBERS.includes(hFinal)) {
        // JACKPOT! 3x win
        moneyChange = bet * 3;
        multiplier = 3;
        resultText = "🎉 JACKPOT! Menang 3x!";
      } else if (pFinal > hFinal) {
        // Regular win - 2x
        moneyChange = bet * 2;
        multiplier = 2;
        resultText = "🎉 Menang 2x!";
      } else if (pFinal === hFinal) {
        // Draw - lose bet
        moneyChange = -bet;
        multiplier = -1;
        resultText = "🤝 Seri - kalah taruhan";
      } else {
        // Loss
        moneyChange = -bet;
        multiplier = -1;
        resultText = "😞 Kalah";
      }

      // Update money via Firebase
      const newMoney = money + moneyChange;
      const updateResult = await updateMoney(newMoney);
      
      if (updateResult.success) {
        setMoneyState(newMoney);
        
        const spinResult = {
          segment: { label: pFinal.toString(), color: pFinal === 0 ? "#FFD700" : (pFinal % 2 === 0 ? "#FFFFFF" : "#FF0000") },
          moneyChange: moneyChange,
          multiplier: multiplier,
          playerNumber: pNum,
          houseNumber: hNum,
          playerDigit: pFinal,
          houseDigit: hFinal,
          result: moneyChange > 0 ? "win" : "lose",
          bet: bet,
          timestamp: Date.now()
        };
        
        setResult(spinResult);
        
        // Save transaction and history
        await userService.addTransaction(playerName, {
          game: "GameReme",
          moneyChange: moneyChange,
          multiplier: multiplier,
          result: moneyChange > 0 ? "win" : "lose",
          segment: pFinal.toString(),
          bet: bet,
          timestamp: Date.now()
        });
        
        saveLastResult(spinResult);
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
      localStorage.removeItem('reme_last_results');
      setLastResults([]);
      setStatus("✅ Saldo direset ke 1000");
      // Reset game juga
      setHouseNumber(0);
      setPlayerNumber(0);
      setHouseDigit(0);
      setPlayerDigit(0);
      setRotation(0);
    } else {
      setStatus("❌ Error reset saldo");
    }
  };

  // Compact name input untuk mobile
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
                className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
              />
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed"
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

  // Loading state
  if (!playerName && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Selamat datang di Game Reme!</h2>
          <p className="text-white/70 mb-4">Masukkan nama Anda untuk mulai bermain</p>
          <CompactNameInput onSave={savePlayerName} />
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
          Reset Uang
        </button>
      </motion.header>

      {/* Player Info & Money */}
      <motion.div 
        className="mb-8 text-center z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-white/70 text-lg">Selamat datang, {playerName}!</p>
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
              className="w-full bg-white/10 placeholder-white/60 px-4 py-3 rounded-xl outline-none border border-white/20 text-white text-lg focus:border-purple-400 transition-colors"
              min="10"
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

        {/* Game Display - Similar to LuckyWheel */}
        <div className="relative mb-6">
          {/* Wheel Pointer */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-yellow-400 z-20"></div>
          
          {/* Wheel */}
          <motion.div 
            className="relative w-80 h-80 rounded-full border-8 border-white/20 shadow-2xl overflow-hidden mx-auto"
            animate={{ rotate: rotation }}
            transition={{ 
              duration: spinning ? 3.5 : 0, 
              ease: spinning ? [0.25, 0.1, 0.25, 1] : "linear",
              type: "spring",
              stiffness: 100
            }}
          >
            {/* Wheel Segments */}
            {Array.from({ length: 37 }, (_, i) => {
              const angle = 360 / 37;
              const rotation = i * angle;
              
              return (
                <div
                  key={i}
                  className="absolute w-full h-full"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((angle * Math.PI) / 180)}% ${50 - 50 * Math.cos((angle * Math.PI) / 180)}%)`
                  }}
                >
                  <div 
                    className="w-full h-full flex items-start justify-center pt-8"
                    style={{ backgroundColor: i === 0 ? "#FFD700" : (i % 2 === 0 ? "#FFFFFF" : "#FF0000") }}
                  >
                    <span className="text-black font-bold text-sm transform -rotate-90">
                      {i}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-slate-800 rounded-full border-4 border-white/30 flex items-center justify-center">
              <span className="text-white font-bold text-xl">🎯</span>
            </div>
          </motion.div>

          {/* Numbers Display */}
          <div className="flex justify-between mt-6">
            <motion.div 
              className="text-center"
              animate={spinning ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <p className="text-white/70 text-sm mb-2">House</p>
              <motion.div 
                className={`w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg ${houseNumber === 0 ? "bg-yellow-500" : (houseNumber % 2 === 0 ? "bg-white text-black" : "bg-red-500")}`}
                animate={spinning ? { rotate: [0, 360] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {spinning ? "🌀" : houseNumber}
              </motion.div>
              <p className="text-white/60 text-xs mt-1">→ {houseDigit}</p>
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
                className={`w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg ${playerNumber === 0 ? "bg-yellow-500" : (playerNumber % 2 === 0 ? "bg-white text-black" : "bg-red-500")}`}
                animate={spinning ? { rotate: [0, -360] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {spinning ? "🌀" : playerNumber}
              </motion.div>
              <p className="text-white/60 text-xs mt-1">→ {playerDigit}</p>
            </motion.div>
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
            "🎲 Putar Roda"
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
                {result.moneyChange > 0 ? "🎉" : "😞"}
              </motion.div>
              <h3 
                className={`text-2xl font-bold mb-2 ${
                  result.moneyChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {result.text}
              </h3>
              <p className="text-white/60">
                Anda: {result.playerDigit} vs House: {result.houseDigit}
              </p>
              <p className="text-white/60">
                Bet: Rp {bet.toLocaleString()} → {result.moneyChange > 0 ? '+' : ''}Rp {result.moneyChange.toLocaleString()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last Results */}
      {lastResults.length > 0 && (
        <motion.div 
          className="max-w-md w-full glass-lonjong rounded-2xl p-6 mb-6 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="font-semibold mb-4 text-white">Riwayat Putaran</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {lastResults.map((result, i) => (
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
                    style={{ backgroundColor: result.segment.color }}
                  ></div>
                  <span className="text-sm">🏠{result.houseDigit} vs 🎯{result.playerDigit}</span>
                </div>
                <div className={`text-xs px-2 py-1 rounded ${
                  result.moneyChange > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {result.moneyChange > 0 ? `+${result.moneyChange}` : result.moneyChange}
                </div>
              </motion.div>
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
            <h3 className="font-semibold mb-3 text-white flex items-center gap-2">
              📋 Aturan Main
            </h3>
            <ul className="list-disc list-inside space-y-2">
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
    </div>
  );
}

