import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const GRID_SIZE = 5;
const TOTAL_BOXES = GRID_SIZE * GRID_SIZE;

export default function Mines() {
  const nav = useNavigate();
  
  // FIXED: Default player untuk mode tanpa nama
  const defaultPlayer = {
    nama: "Guest Player",
    money: 1000
  };

  const [bet, setBet] = useState(10);
  const [grid, setGrid] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [multiplier, setMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [money] = useState(1000);

  // FIXED: Simplified money management
  const getMoney = () => {
    const saved = localStorage.getItem('mines_money');
    return saved ? parseInt(saved) : 1000;
  };

  const setMoney = (amount) => {
    localStorage.setItem('mines_money', String(amount));
    setMoney(amount);
  };

  useEffect(() => {
    // Load money on mount
    const savedMoney = getMoney();
    setMoney(savedMoney);
    
    // Load player name if exists
    const savedName = localStorage.getItem('mines_player_name');
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  const bombCount = Math.max(1, Math.min(5, Math.floor(bet / 50)));

  const initGrid = () => {
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
    initGrid();
  }, [bet]);

  const clickBox = (index) => {
    if (gameOver || revealed[index]) return;
    
    const val = grid[index];
    const newRev = [...revealed];
    newRev[index] = true;
    setRevealed(newRev);

    if (val === "bomb") {
      const newMoney = money - bet;
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
    const newMoney = money + win;
    setMoney(newMoney);
    setGameOver(true);
    setStatus(`✅ Cash out Rp ${win.toFixed(0)} (Pengali: ${multiplier.toFixed(2)}x)`);
  };

  const handleBetChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    const maxBet = Math.min(money, 10000);
    const minBet = 10;
    setBet(Math.max(minBet, Math.min(maxBet, value)));
  };

  const resetMoney = () => {
    setMoney(1000);
    initGrid();
  };

  const savePlayerName = (name) => {
    setPlayerName(name);
    localStorage.setItem('mines_player_name', name);
  };

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
        <button onClick={resetMoney} className="bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-lg text-sm text-white hover:bg-white/20 transition-colors">
          Reset Uang
        </button>
      </header>

      {/* Player Name Input */}
      {!playerName && (
        <motion.div 
          className="mb-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4"
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
                if (e.key === 'Enter') {
                  savePlayerName(e.target.value);
                }
              }}
            />
            <button
              onClick={(e) => savePlayerName(e.target.previousElementSibling.value)}
              className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg text-white"
            >
              Simpan
            </button>
          </div>
        </motion.div>
      )}

      {playerName && (
        <>
          {/* Player Info */}
          <div className="mb-6 text-center">
            <p className="text-white/70 text-sm">Pemain</p>
            <p className="text-lg font-semibold text-white">{playerName}</p>
            <p className="text-white/70 text-sm">Saldo Anda</p>
            <motion.p 
              className="text-3xl font-bold text-purple-400"
              key={money}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
            >
              Rp {money.toLocaleString()}
            </motion.p>
          </div>

          {/* Game Controls */}
          <div className="flex items-center gap-4 mb-6 w-full max-w-md">
            <div className="flex-1">
              <label className="text-white/70 text-sm mb-1 block">Taruhan</label>
              <input
                type="number"
                value={bet}
                onChange={handleBetChange}
                className="w-full bg-white/10 placeholder-white/60 px-3 py-2 rounded-lg outline-none border border-white/20 text-white"
                min="10"
                max={money}
              />
            </div>
            <div className="text-center">
              <p className="text-white/70 text-sm mb-1">Ranjau</p>
              <p className="text-lg font-bold text-red-400">{bombCount}</p>
            </div>
            <div className="text-center">
              <p className="text-white/70 text-sm mb-1">Pengali</p>
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
                <p className="text-white">{status}</p>
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
        </>
      )}
    </div>
  );
}

