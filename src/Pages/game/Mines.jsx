import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { daftarSiswa } from "../../data/siswa";

const GRID_SIZE = 5;
const TOTAL_BOXES = GRID_SIZE * GRID_SIZE;

export default function Mines() {
  const { nama } = useParams(); // /game/mines/:nama
  const nav = useNavigate();
  const base = daftarSiswa.find((s) => s.nama === decodeURIComponent(nama));
  if (!base) return <div className="text-white p-6">Tidak ditemukan</div>;

  // saldo & taruhan → dari data siswa
  const [bet, setBet] = useState(10);
  const [grid, setGrid] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [multiplier, setMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState("");

  // load & save saldo ke localStorage per-siswa
  const getMoney = () => parseInt(localStorage.getItem(`money_${base.nama}`) || "1000");
  const setMoney = (val) => localStorage.setItem(`money_${base.nama}`, String(val));
  const [money, setMoneyState] = useState(getMoney());

  // hitung jumlah bom → 10% dari taruhan (min 1, max 5)
  const bombCount = Math.max(1, Math.min(5, Math.floor(bet / 100)));

  // inisialisasi grid
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
        arr[i] = Math.random() * 1.9 + 0.1; // 0.1-2x
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

  // klik kotak
  const clickBox = (index) => {
    if (gameOver || revealed[index]) return;
    const val = grid[index];
    const newRev = [...revealed];
    newRev[index] = true;
    setRevealed(newRev);

    if (val === "bomb") {
      // kalah
      const newMoney = getMoney() - bet;
      setMoney(newMoney);
      localStorage.setItem(`money_${base.nama}`, String(newMoney));
      setGameOver(true);
      setStatus("💥 Anda menabrak ranjau!");
    } else {
      // menang → kumpulkan pengali
      setMultiplier((m) => m * val);
      setStatus(`💎 Berlian! Pengali: ${val.toFixed(2)}x`);
    }
  };

  const cashOut = () => {
    if (gameOver) return;
    const win = bet * multiplier;
    const newMoney = getMoney() + win;
    setMoney(newMoney);
    localStorage.setItem(`money_${base.nama}`, String(newMoney));
    setGameOver(true);
    setStatus(`✅ Cash out! Anda menang Rp ${win.toFixed(0)}`);
  };

  const resetMoney = () => {
    localStorage.setItem(`money_${base.nama}`, "1000");
    setMoney(1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black flex flex-col items-center justify-center px-6">
      {/* Header */}
      <header className="flex items-center gap-3 p-6">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">←</button>
        <h1 className="text-xl font-bold text-white">Game Mines – {base.nama}</h1>
        <button onClick={resetMoney} className="ml-auto glass-button px-3 py-1 rounded-lg text-sm">Reset Uang</button>
      </header>

      {/* Saldo */}
      <div className="mb-6 text-center">
        <p className="text-white/70">Saldo Anda</p>
        <p className="text-3xl font-bold text-purple-400">Rp {money.toLocaleString()}</p>
      </div>

      {/* Taruhan & Multiplier */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="number"
          value={bet}
          onChange={(e) => setBet(Math.max(1, Math.min(getMoney(), parseInt(e.target.value) || 1)))}
          className="w-32 bg-white/10 placeholder-white/60 px-3 py-2 rounded-lg outline-none border border-white/20"
          min="1"
          max={getMoney()}
        />
        <button onClick={cashOut} disabled={gameOver} className="glass-button px-4 py-2 rounded-lg disabled:opacity-50">
          Cash Out
        </button>
      </div>

      {/* Grid Kotak – glass-lonjong */}
      <div className="grid grid-cols-5 gap-3 w-full max-w-md mb-6">
        {grid.map((val, i) => (
          <button
            key={i}
            onClick={() => clickBox(i)}
            disabled={gameOver || revealed[i]}
            className={`w-16 h-16 rounded-lg flex items-center justify-center text-xl font-bold transition-all 
              ${revealed[i] ? (val === "bomb" ? "bg-red-500" : "bg-green-500") : "bg-white/10 hover:bg-white/20"} 
              disabled:cursor-not-allowed border border-white/20`}
            title={revealed[i] ? (val === "bomb" ? "💥" : `💎 ${val.toFixed(2)}x`) : "?"}
          >
            {revealed[i] ? (val === "bomb" ? "💥" : "💎") : "?"}
          </button>
        ))}
      </div>

      {/* Status & Multiplier */}
      <div className="mb-4 text-center">
        <p className="text-white/70 text-sm">Pengali: {multiplier.toFixed(2)}x</p>
        {status && <p className="mt-2">{status}</p>}
      </div>

      {/* Aturan */}
      <div className="max-w-md w-full glass-lonjong rounded-2xl p-4 text-white/80 text-sm">
        <h3 className="font-semibold mb-2">Aturan Singkat</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Grid 5×5 → kotak tersembunyi</li>
          <li>Berlian → pengali 0.1-2x (random)</li>
          <li>Ranjau → game over</li>
          <li>Semakin besar taruhan → semakin banyak ranjau</li>
          <li>Cash out kapan pun → kumpulkan pengali</li>
        </ul>
      </div>

      {/* CSS animasi kosong (tanpa orbit) */}
    </div>
  );
}

