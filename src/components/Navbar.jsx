import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { daftarSiswa } from "../data/siswa";
import LoginPopup from "./LoginPopup";
import { motion } from "framer-motion";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Gallery", path: "/#Gallery" },
  { label: "Schedule", path: "/#Tabs" },
  { label: "Games", path: "/games" },
];

export default function Navbar() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [hasil, setHasil] = useState([]);
  const [openLogin, setOpenLogin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const cari = (e) => {
    const q = e.target.value;
    setQuery(q);
    if (!q) return setHasil([]);
    const filter = daftarSiswa.filter((s) =>
      s.nama.toLowerCase().includes(q.toLowerCase())
    );
    setHasil(filter.slice(0, 5));
  };

  const handleLogin = (userData) => {
    // Login logic here
    setOpenLogin(false);
    // Redirect to games or refresh
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
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

        {/* Kanan = Login/Profile */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 glass-button px-4 py-2 rounded-full text-sm"
            >
              <img src="/user.svg" alt="User" className="w-5 h-5" />
              <span className="hidden sm:inline">{user.nama}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <motion.div 
                className="absolute right-0 top-full mt-2 w-48 rounded-lg glass-card p-2 space-y-1 text-sm text-white z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <button
                  onClick={() => {
                    nav(`/profile/${encodeURIComponent(user.nama)}`);
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/10 flex items-center gap-2"
                >
                  <span>👤</span> Profil
                </button>
                <button
                  onClick={() => {
                    nav("/games");
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/10 flex items-center gap-2"
                >
                  <span>🎮</span> Games
                </button>
                <hr className="border-white/20" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/10 flex items-center gap-2 text-red-400"
                >
                  <span>🚪</span> Logout
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setOpenLogin(true)}
            className="glass-button px-4 py-2 rounded-full text-sm"
          >
            Login
          </button>
        )}
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

          {/* Kanan = Login/Profile */}
          {user ? (
            <button
              onClick={() => nav(`/profile/${encodeURIComponent(user.nama)}`)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
            >
              <span className="text-xs font-bold text-white">
                {user.nama.charAt(0).toUpperCase()}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setOpenLogin(true)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
            >
              <img src="/user.svg" alt="User" className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Pop-up Login */}
      {openLogin && <LoginPopup onClose={() => setOpenLogin(false)} onLogin={handleLogin} />}
    </>
  );
}

