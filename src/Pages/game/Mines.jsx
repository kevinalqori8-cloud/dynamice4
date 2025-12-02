import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { daftarSiswa } from "../../data/siswa";
import { motion } from "framer-motion"; // Tambahkan animasi

const GRID_SIZE = 5;
const TOTAL_BOXES = GRID_SIZE * GRID_SIZE;

export default function Mines() {
  const { nama } = useParams();
  const nav = useNavigate(); // FIXED: Typo navigate -> nav
  
  // DEBUG: Cek apakah nama ada
  console.log("Params nama:", nama);
  
  const base = daftarSiswa.find((s) => {
    const decodedNama = decodeURIComponent(nama || "");
    console.log("Comparing:", s.nama, "with", decodedNama);
    return s.nama === decodedNama;
  });

  console.log("Found base:", base);

  if (!base) {
    console.log("Base not found, rendering error");
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black flex items-center justify-center">
        <div className="text-white text-center p-6">
          <h2 className="text-2xl font-bold mb-2">❌ Siswa Tidak Ditemukan</h2>
          <p className="text-white/70 mb-4">Nama: {nama}</p>
          <button 
            onClick={() => nav(-1)} 
            className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg text-white"
          >
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  const [bet, setBet] = useState(10);
  const [grid, setGrid] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [multiplier, setMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState("");

  // Money management
  const getMoney = () => {
    const saved = localStorage.getItem(`money_${base.nama}`);
    const value = parseInt(saved || "1000");
    console.log(`Getting money for ${base.nama}:`, value);
    return value;
  };

  const setMoney = (val) => {
    console.log(`Setting money for ${base.nama}:`, val);
    localStorage.setItem(`money_${base.nama}`, String(val));
    setMoneyState(val);
  };

  const [money, setMoneyState] = useState(getMoney());

  // Bomb count calculation
  const bombCount = Math.max(1, Math.min(5, Math.floor(bet / 50)));

  const initGrid = () => {
    console.log("Initializing grid with bomb count:", bombCount);
    const arr = Array(TOTAL_BOXES).fill(null);
    const bombIndices = [];
    
    while (bombIndices.length < bombCount) {
      const i = Math.floor(Math.random() * TOTAL_BOXES);
      if (!bombIndices.includes(i)) bombIndices.push(i);
    }
    
    for (let i = 0; i < TOTAL_BOXES; i++) {
      if (bombIndices.includes(i)) {
        arr[i] = "bomb";
      } else {
        arr[i] = Math.random() * 1.9 + 0.1;
      }
    }
    
    setGrid(arr);
    setRevealed(Array(TOTAL_BOXES).fill(false));
    setMultiplier(1);
    setGameOver(false);
    setStatus("");
  };

  useEffect(() => {
    console.log("Effect triggered - initializing grid");
    initGrid();
  }, [bet, base.nama]);

  const clickBox = (index) => {
    if (gameOver || revealed[index]) return;
    
    const val = grid[index];
    const newRev = [...revealed];
    newRev[index] = true;
    setRevealed(newRev);

    if (val === "bomb") {
      const newMoney = getMoney() - bet;
      setMoney(newMoney);
      setGameOver(true);
      setStatus(`💥 Anda menabrak ranjau! Kehilangan Rp ${bet.toLocaleString()}`);
    } else {
      const newMultiplier = multiplier * val;
      setMultiplier(newMultiplier);
      setStatus(`💎 Berlian! Total Pengali: ${newMultiplier.toFixed(2)}x`);
    }
  };

  const cashOut = () => {
    if (gameOver) return;
    const win = bet * multiplier;
    const newMoney = getMoney() + win;
    setMoney(newMoney);
    setGameOver(true);
    setStatus(`✅ Cash out Rp ${win.toFixed(0)} (Pengali: ${multiplier.toFixed(2)}x)`);
  };

  // FIXED: Bet validation yang lebih aman
  const handleBetChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    const maxBet = Math.min(getMoney(), 10000); // Max bet 10k
    const minBet = 10; // Min bet 10
    setBet(Math.max(minBet, Math.min(maxBet, value)));
  };

  // Loading state untuk grid
  if (grid.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black flex flex-col items-center justify-center px-6 py-4">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 w-full max-w-md">
        <button 
          onClick={() => nav(-1)} 
          className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-white flex-1">Game Mines</h1>
        <div className="text-right">
          <p className="text-xs text-white/60">{base.nama}</p>
          <p className="text-sm text-purple-400">Rp {money.toLocaleString()}</p>
        </div>
      </header>

      {/* Game Stats */}
      <div className="flex items-center gap-4 mb-6 w-full max-w-md">
        <div className="flex-1 text-center">
          <p className="text-white/60 text-xs">Taruhan</p>
          <input
            type="number"
            value={bet}
            onChange={handleBetChange}
            className="w-full bg-white/10 placeholder-white/60 px-3 py-2 rounded-lg outline-none border border-white/20 text-white text-center"
            min="10"
            max={getMoney()}
          />
        </div>
        <div className="text-center">
          <p className="text-white/60 text-xs">Ranjau</p>
          <p className="text-lg font-bold text-red-400">{bombCount}</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-xs">Pengali</p>
          <p className="text-lg font-bold text-green-400">{multiplier.toFixed(2)}x</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6 w-full max-w-md">
        <button 
          onClick={cashOut} 
          disabled={gameOver}
          className="flex-1 bg-green-500/20 backdrop-blur-sm border border-green-500/30 py-3 rounded-lg text-green-300 disabled:opacity-50 hover:bg-green-500/30 transition-colors font-semibold"
        >
          💰 Cash Out
        </button>
        <button 
          onClick={() => initGrid()} 
          className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 py-3 rounded-lg text-white hover:bg-white/20 transition-colors font-semibold"
        >
          🔄 New Game
        </button>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-5 gap-2 w-full max-w-md mb-6">
        {grid.map((val, i) => (
          <motion.button
            key={i}
            onClick={() => clickBox(i)}
            disabled={gameOver || revealed[i]}
            className={`
              aspect-square rounded-lg flex items-center justify-center text-2xl font-bold transition-all
              ${revealed[i] 
                ? (val === "bomb" 
                  ? "bg-red-500 text-white border-red-400" 
                  : "bg-green-500 text-white border-green-400")
                : "bg-white/10 hover:bg-white/20 border border-white/20"
              }
              disabled:cursor-not-allowed
              ${!revealed[i] && !gameOver ? "hover:scale-105 active:scale-95" : ""}
            `}
            whileHover={!revealed[i] && !gameOver ? { scale: 1.05 } : {}}
            whileTap={!revealed[i] && !gameOver ? { scale: 0.95 } : {}}
          >
            {revealed[i] ? (val === "bomb" ? "💥" : "💎") : "?"}
          </motion.button>
        ))}
      </div>

      {/* Status */}
      {status && (
        <motion.div 
          className="mb-4 text-center max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3">
            <p className="text-white text-sm">{status}</p>
          </div>
        </motion.div>
      )}

      {/* Game Info */}
      <div className="max-w-md w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white/80 text-xs">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-white/60">Potential Win</p>
            <p className="text-green-400 font-semibold">Rp {(bet * multiplier).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/60">Boxes Left</p>
            <p className="text-blue-400 font-semibold">
              {TOTAL_BOXES - revealed.filter(Boolean).length}
            </p>
          </div>
          <div>
            <p className="text-white/60">Bombs</p>
            <p className="text-red-400 font-semibold">{bombCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

