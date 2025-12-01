// src/components/LoginPopup.jsx
import React, { useState } from "react";
import { daftarSiswa } from "../data/siswa";

export default function LoginPopup({ onClose }) {
  const [nama, setNama]     = useState("");
  const [pass, setPass]     = useState("");
  const [error, setError]   = useState("");

  const login = () => {
    const siswa = daftarSiswa.find((s) => s.nama === nama.trim());
    if (!siswa) return setError("Nama tidak ditemukan");
    // password = 01072010 (contoh)
    if (pass.trim() !== "01072010") return setError("Password salah");
    localStorage.setItem("user", JSON.stringify(siswa));
    onClose();
    window.location.reload(); // refresh agar navbar tau
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div
        className="relative w-full max-w-sm rounded-2xl glass-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white">✕</button>
        <h2 className="text-white font-bold mb-4">Login Siswa</h2>
        <input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Nama lengkap"
          className="w-full bg-white/10 placeholder-white/60 px-3 py-2 rounded-lg mb-3 outline-none border border-white/20 focus:border-white/40"
        />
        <input
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Password (tgl lahir: 01072010)"
          type="password"
          className="w-full bg-white/10 placeholder-white/60 px-3 py-2 rounded-lg mb-3 outline-none border border-white/20 focus:border-white/40"
        />
        {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
        <button onClick={login} className="w-full glass-button py-2 rounded-lg">Masuk</button>
      </div>
    </div>
  );
}

