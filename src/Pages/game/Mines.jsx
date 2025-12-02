import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { daftarSiswa } from "../../data/siswa";

const GRID_SIZE = 5;
const TOTAL_BOXES = GRID_SIZE * GRID_SIZE;

export default function Mines() {
  const { nama } = useParams();
  const nav = useNavigate();
  const base = daftarSiswa.find((s) => s.nama === decodeURIComponent(nama));
  if (!base) return <div className="text-white p-6">Tidak ditemukan</div>;

  const [bet, setBet] = useState(10);
  const [grid, setGrid] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [multiplier, setMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState("");

  const getMoney = () => parseInt(localStorage.getItem(`money_${base.nama}`) || "1000");
  const setMoney = (val) => {
    localStorage.setItem(`money_${base.nama}`, String(val));
    setMoneyState(val);
  };
  const [money, setMoneyState] = useState(getMoney());

  // FIXED: Bomb count yang lebih adil
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
      setMultiplier((m) => m * val);
      setStatus(`💎 Berlian! Pengali: ${(multiplier * val).toFixed(2)}x`);
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

  const resetGame = () => {
    initGrid();
    setStatus("");
    setGameOver(false);
  };

  const resetMoney = () => {
    setMoney(1000);
    resetGame();
  };

  // FIXED: Bet validation yang lebih baik
  const handleBetChange = (e) => {
    const newBet = parseInt(e.target.value) || 1;
    if (newBet <= 0) {
      setBet(1);
    } else if (newBet > getMoney()) {
      setBet(getMoney());
    } else {
      setBet(newBet);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black flex flex-col items-center justify-center px-6">
      {/* FIXED: Header dengan nav yang benar */}
      <header className="flex items-center gap-3 p-6 w-full max-w-md">
        <button onClick={() => nav(-1)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
          ←
        </button>
        <h1 className="text-xl font-bold text-white flex-1">Game Mines – {base.nama}</h1>
        <button onClick={resetMoney} className="bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-lg text-sm text-white hover:bg-white/20 transition-colors">
          Reset Uang
        </button>
      </header>

      {/* Saldo dengan animasi */}
      <motion.div 
        className="mb-6 text-center"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        key={money}
      >
        <p className="text-white/70 text-sm">Saldo Anda</p>
        <p className="text-3xl font-bold text-purple-400">Rp {money.toLocaleString()}</p>
      </motion.div>

      {/* FIXED: Kontrol taruhan dengan validasi */}
      <div className="flex items-center gap-4 mb-6 w-full max-w-md">
        <div className="flex-1">
          <label className="text-white/70 text-sm mb-1 block">Taruhan</label>
          <input
            type="number"
            value={bet}
            onChange={handleBetChange}
            className="w-full bg-white/10 placeholder-white/60 px-3 py-2 rounded-lg outline-none border border-white/20 text-white"
            min="1"
            max={getMoney()}
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={cashOut} 
            disabled={gameOver} 
            className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 px-4 py-2 rounded-lg text-green-300 disabled:opacity-50 hover:bg-green-500/30 transition-colors"
          >
            Cash Out
          </button>
          <button 
            onClick={resetGame} 
            className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            New Game
          </button>
        </div>
      </div>

      {/* FIXED: Grid dengan styling yang lebih baik */}
      <div className="grid grid-cols-5 gap-3 w-full max-w-md mb-6">
        {grid.map((val, i) => (
          <motion.button
            key={i}
            onClick={() => clickBox(i)}
            disabled={gameOver || revealed[i]}
            className={`
              w-16 h-16 rounded-lg flex items-center justify-center text-xl font-bold transition-all
              ${revealed[i] 
                ? (val === "bomb" 
                  ? "bg-red-500 text-white" 
                  : "bg-green-500 text-white")
                : "bg-white/10 hover:bg-white/20 border border-white/20"
              }
              disabled:cursor-not-allowed
              ${!revealed[i] && !gameOver ? "hover:scale-105" : ""}
            `}
            whileHover={!revealed[i] && !gameOver ? { scale: 1.05 } : {}}
            whileTap={!revealed[i] && !gameOver ? { scale: 0.95 } : {}}
            title={revealed[i] ? (val === "bomb" ? "💥" : `💎 ${val.toFixed(2)}x`) : "?"}
          >
            {revealed[i] ? (val === "bomb" ? "💥" : "💎") : "?"}
          </motion.button>
        ))}
      </div>

      {/* Status & Multiplier dengan animasi */}
      <motion.div 
        className="mb-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={status}
      >
        <p className="text-white/70 text-sm">Pengali: {multiplier.toFixed(2)}x</p>
        {status && (
          <motion.p 
            className="mt-2 text-white"
            initial={{ y: 10 }}
            animate={{ y: 0 }}
          >
            {status}
          </motion.p>
        )}
      </motion.div>

      {/* FIXED: Aturan dengan styling yang benar */}
      <div className="max-w-md w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-white/80 text-sm">
        <h3 className="font-semibold mb-2 text-white">💡 Aturan Singkat</h3>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Grid 5×5 → {bombCount} ranjau tersembunyi</li>
          <li>Berlian → pengali 0.1-2x (random)</li>
          <li>Ranjau → game over, kehilangan taruhan</li>
          <li>Semakin besar taruhan → semakin banyak ranjau</li>
          <li>Cash out kapan pun → kumpulkan pengali</li>
        </ul>
      </div>
    </div>
  );
}

