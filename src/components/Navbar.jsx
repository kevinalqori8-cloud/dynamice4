// src/components/Navbar.jsx
// src/components/Navbar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { daftarSiswa } from "../data/siswa"; // daftar nama saja
import LoginPopup from "./LoginPopup";       // pop-up login
import AOS from "aos";
// src/components/Navbar.jsx


const navLinks = [
  { label: "Home", path: "/" },
  { label: "Gallery", path: "/#Gallery" },
  { label: "Schedule", path: "/#Tabs" },
];

export default function Navbar() {
  const nav = useNavigate();
  const [query, setQuery]   = useState("");
  const [hasil, setHasil]   = useState([]);
  const [openLogin, setOpenLogin] = useState(false);

  const cari = (e) => {
    const q = e.target.value;
    setQuery(q);
    if (!q) return setHasil([]);
    const filter = daftarSiswa.filter((s) =>
      s.nama.toLowerCase().includes(q.toLowerCase())
    );
    setHasil(filter.slice(0, 5)); // max 5
  };

  return (
    <>
      {/* ======= DESKTOP ======= */}
      <header
        className="hidden lg:flex items-center justify-between px-6 py-3 rounded-full 
                     glass-card max-w-5xl mx-auto mt-6"
        data-aos="fade-down"
      >
        <img src="/LogoPHI.png" alt="Logo" className="w-9 h-9 rounded-full" />

        {/* Tengah = Search bar */}
        <div className="relative flex-1 max-w-xs mx-4">
          <input
            type="text"
            value={query}
            onChange={cari}
            placeholder="Cari siswa..."
            className="w-full bg-white/10 placeholder-white/60 px-3 py-2 rounded-full text-sm outline-none border border-white/20 focus:border-white/40"
          />
          {hasil.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-lg glass-card p-2 space-y-1 text-sm text-white">
              {hasil.map((s) => (
                <button
                  key={s.nama}
                  onClick={() => {
                    nav(`/profile/${encodeURIComponent(s.nama)}`);
                    setQuery(""); setHasil([]);
                  }}
                  className="w-full text-left px-2 py-1 rounded hover:bg-white/10"
                >
                  {s.nama}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Kanan = Login */}
        <button
          onClick={() => setOpenLogin(true)}
          className="glass-button px-4 py-2 rounded-full text-sm"
        >
          Login
        </button>
      </header>

      {/* ======= MOBILE ======= */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 pt-4"
        data-aos="fade-down"
      >
        <div className="flex items-center justify-between rounded-full glass-card px-4 py-3">
          {/* Kiri = menu hamburger */}
          <button
            onClick={() => nav("/menu")}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Tengah = Search */}
          <div className="relative flex-1 mx-3">
            <input
              type="text"
              value={query}
              onChange={cari}
              placeholder="Cari siswa..."
              className="w-full bg-white/10 placeholder-white/60 px-3 py-2 rounded-full text-sm outline-none border border-white/20"
            />
            {hasil.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-lg glass-card p-2 space-y-1 text-sm text-white max-h-40 overflow-y-auto">
                {hasil.map((s) => (
                  <button
                    key={s.nama}
                    onClick={() => {
                      nav(`/portfolio/${encodeURIComponent(s.nama)}`);
                      setQuery(""); setHasil([]);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-white/10"
                  >
                    {s.nama}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Kanan = Login */}
          <button
            onClick={() => setOpenLogin(true)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <img src="/user.svg" alt="User" className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Pop-up Login */}
      {openLogin && <LoginPopup onClose={() => setOpenLogin(false)} />}
    </>
  );
}

