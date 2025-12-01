import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { daftarSiswa } from "../../data/siswa";

const STORAGE_KEY = "game_money";

export default function GameReme() {
  const nav = useNavigate();
  const [bet, setBet] = useState(10);
  const [house, setHouse] = useState(0);
  const [player, setPlayer] = useState(0);
  const [status, setStatus] = useState("");
  const [spinning, setSpinning] = useState(false);
  const specialnum = [0, 28, 19];

  // load & save saldo ke localStorage per-siswa
  const getMoney = () => parseInt(localStorage.getItem(`money_${base.nama}`) || "1000");
  const setMoney = (val) => localStorage.setItem(`money_${base.nama}`, String(val));
  const [money, setMoneyState] = useState(getMoney());

  // simpan uang ke localStorage
  useEffect(() => {
    setMoney(money);
  }, [money]);

  // warna roulette (0-36)
  const getColor = (n) => {
    if (n === 0) return "bg-green-500"; // 0 → hijau
    return n % 2 === 0 ? "bg-white" : "bg-red-500"; // genap putih, ganjil merah
  };

  // hitung digit
  const calcDigit = (n) => {
    let sum = String(n).split("").reduce((a, b) => Number(a) + Number(b), 0);
    if (sum > 9) sum = Number(String(sum).slice(-1));
    return sum;
  };

  // putar roda
  const spin = () => {
    if (bet <= 0 || bet > money) return alert("Bet tidak valid");
    setSpinning(true);
    setStatus("");

    const h = Math.floor(Math.random() * 37); // 0-36
    const p = Math.floor(Math.random() * 37); // 0-36

    const hFinal = calcDigit(h);
    const pFinal = calcDigit(p);

    setTimeout(() => {
      setHouse(hFinal);
      setPlayer(pFinal);
      setSpinning(false);

      // aturan menang/kalah
      if (specialnum.includes(pFinal) && !specialnum.includes(hFinal)) {
        // 0 & bukan seri → 3x
        setMoney((m) => m + bet * 3);
        setStatus("🎉 Anda menang 3x!");
      } else if (pFinal > hFinal) {
        // menang → 2x
        setMoney((m) => m + bet * 2);
        setStatus("🎉 Anda menang 2x!");
      } else if (pFinal === hFinal) {
        // seri → kalah
        setMoney((m) => m - bet);
        setStatus("😞 Anda kalah");
      } else if (pFinal < hFinal) {
        // seri → kalah
        setMoney((m) => m - bet);
        setStatus("😞 Anda kalah");
	}
	 else {
        // kalah
        setMoney((m) => m - bet);
        setStatus("😞 Anda kalah");
      }
    }, 1500);
  };

  const resetMoney = () => {
    localStorage.setItem(STORAGE_KEY, "1000");
    setMoney(1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black flex flex-col items-center justify-center px-6">
      {/* Header */}
      <header className="flex items-center gap-3 p-6">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">←</button>
        <h1 className="text-xl font-bold text-white">Game Reme</h1>
        <button onClick={resetMoney} className="ml-auto glass-button px-3 py-1 rounded-lg text-sm">Reset Uang</button>
      </header>

      {/* Saldo */}
      <div className="mb-6 text-center">
        <p className="text-white/70">Saldo Anda</p>
        <p className="text-3xl font-bold text-purple-400">Rp {localStorage.getItem(`money_${base.nama}`)}</p>
      </div>

      {/* Game Board – glass-lonjong */}
      <div className="max-w-md w-full glass-lonjong rounded-2xl p-6 mb-6">
        {/* Input Taruhan */}
        <div className="mb-4">
          <label className="text-white/70 text-sm">Taruhan (Rp)</label>
          <input
            type="number"
            value={bet}
            onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full mt-1 bg-white/10 placeholder-white/60 px-3 py-2 rounded-lg outline-none border border-white/20"
            min="1"
            max={money}
          />
        </div>

        {/* Roda & Hasil */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <p className="text-white/70 text-sm">House</p>
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-xl font-bold ${spinning ? "animate-pulse" : ""} ${getColor(house)} border-2 border-white/30`}>
              {spinning ? "🌀" : house}
            </div>
          </div>
          <div className="text-center">
            <p className="text-white/70 text-sm">Anda</p>
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-xl font-bold ${spinning ? "animate-pulse" : ""} ${getColor(player)} border-2 border-white/30`}>
              {spinning ? "🌀" : player}
            </div>
          </div>
        </div>

        {/* Status */}
        {status && <p className="text-center mb-4">{status}</p>}

        {/* Tombol Spin */}
        <button
          onClick={spin}
          disabled={spinning || bet <= 0 || bet > money}
          className="w-full glass-button py-3 rounded-lg disabled:opacity-50"
        >
          {spinning ? "Memutar..." : "Putar Roda"}
        </button>
      </div>

      {/* Aturan */}
      <div className="max-w-md w-full glass-lonjong rounded-2xl p-4 text-white/80 text-sm">
        <h3 className="font-semibold mb-2">Aturan Singkat</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Angka 0-36 → jumlah digit</li>
          <li>Jika masih 2 digit → ambil digit terakhir</li>
          <li>Anda &gt; House → menang 2x</li>
          <li>Anda = 0 &amp; bukan seri → menang 3x</li>
          <li>Seri atau kalah → taruhan hilang</li>
        </ul>
      </div>

      {/* CSS animasi kosong (tidak pakai orbit) */}
    </div>
  );
}

