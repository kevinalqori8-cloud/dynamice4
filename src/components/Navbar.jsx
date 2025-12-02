import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { daftarSiswa } from "../data/siswa";
import LoginPopup from "./LoginPopup";
import { motion, AnimatePresence } from "framer-motion";
import { userService } from "../service/firebaseService";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Gallery", path: "/gallery" },
  { label: "Schedule", path: "/#Tabs" },
  { label: "Leaderboard", path: "/leaderboard" },
  { label: "Games", path: "/game" },
];

export default function Navbar() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [hasil, setHasil] = useState([]);
  const [openLogin, setOpenLogin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login status dari Firebase
  useEffect(() => {
    checkFirebaseLogin();
    
    // Listen untuk perubahan login status
    window.addEventListener('loginStatusChanged', checkFirebaseLogin);
    
    return () => {
      window.removeEventListener('loginStatusChanged', checkFirebaseLogin);
    };
  }, []);

  const checkFirebaseLogin = async () => {
    try {
      setLoading(true);
      // Cek dari localStorage dulu
      const localUser = localStorage.getItem('currentUser');
      if (localUser) {
        const userData = JSON.parse(localUser);
        
        // Verifikasi dengan Firebase
        const firebaseUser = await userService.getUserData(userData.nama);
        if (firebaseUser) {
          setCurrentUser(firebaseUser);
        } else {
          // Hapus localStorage jika tidak valid
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const cari = (e) => {
    const q = e.target.value;
    setQuery(q);
    if (!q) return setHasil([]);
    const filter = daftarSiswa.filter((s) =>
      s.nama.toLowerCase().includes(q.toLowerCase())
    );
    setHasil(filter.slice(0, 5));
  };

  const handleLogin = async (userData) => {
    try {
      setOpenLogin(false);
      
      // Simpan ke Firebase dengan status online
      await userService.updateUserData(userData.nama, {
        ...userData,
        lastLogin: new Date().toISOString(),
        isOnline: true
      });
      
      // Simpan ke localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('lastLoginTime', new Date().toISOString());
      
      setCurrentUser(userData);
      window.dispatchEvent(new Event('loginStatusChanged'));
      
      // Redirect ke games
      nav("/games");
    } catch (error) {
      console.error("Login error:", error);
      alert("❌ Login gagal: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      if (currentUser) {
        // Update status offline di Firebase
        await userService.updateUserData(currentUser.nama, {
          isOnline: false,
          lastLogout: new Date().toISOString()
        });
      }
      
      logout();
      localStorage.removeItem('currentUser');
      localStorage.removeItem('lastLoginTime');
      setCurrentUser(null);
      window.dispatchEvent(new Event('loginStatusChanged'));
      nav("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Bagian Kiri Navbar - Diperbarui dengan tampilan yang lebih menarik
  const BrandSection = () => (
    <motion.div 
      className="flex items-center gap-3 cursor-pointer"
      onClick={() => nav("/")}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div 
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <img 
          src="/LogoPHI.png" 
          alt="Logo" 
          className="w-10 h-10 rounded-full border-2 border-white/30 shadow-lg"
        />
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-sm opacity-30"></div>
      </motion.div>
      
      <div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          GameE4
        </h1>
        <p className="text-xs text-white/60">XE-4 Gaming Portal</p>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <header className="hidden lg:flex items-center justify-between px-6 py-3 rounded-full glass-card max-w-5xl mx-auto mt-6">
        <BrandSection />
        <div className="flex-1 max-w-xs mx-4">
          <div className="w-full bg-white/10 h-8 rounded-full animate-pulse"></div>
        </div>
        <div className="w-20 h-8 bg-white/10 rounded-full animate-pulse"></div>
      </header>
    );
  }

  return (
    <>
      {/* ======= DESKTOP ======= */}
      <header
        className="hidden lg:flex items-center justify-between px-6 py-3 rounded-full 
                     glass-card max-w-5xl mx-auto mt-6"
        data-aos="fade-down"
      >
        {/* Bagian Kiri - Brand yang sudah diperbarui */}
        <BrandSection />

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

        {/* Kanan = Login/Profile - SESUAI STATUS LOGIN */}
        {currentUser ? (
          // Tampilkan menu Portfolio jika sudah login
          <div className="relative">
            <motion.button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 glass-button px-4 py-2 rounded-full text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-xs font-bold">
                {currentUser.nama.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline">{currentUser.nama.split(' ')[0]}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div 
                  className="absolute right-0 top-full mt-2 w-48 rounded-lg glass-card p-2 space-y-1 text-sm text-white z-50"
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.button
                    onClick={() => {
                      nav(`/portfolio/${encodeURIComponent(currentUser.nama)}`);
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-white/10 flex items-center gap-2"
                    whileHover={{ x: 5 }}
                  >
                    <span>📁</span> Portfolio
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      nav("/games");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-white/10 flex items-center gap-2"
                    whileHover={{ x: 5 }}
                  >
                    <span>🎮</span> Games
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      nav("/leaderboard");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-white/10 flex items-center gap-2"
                    whileHover={{ x: 5 }}
                  >
                    <span>🏆</span> Leaderboard
                  </motion.button>
                  <hr className="border-white/20" />
                  <motion.button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded hover:bg-white/10 flex items-center gap-2 text-red-400"
                    whileHover={{ x: 5 }}
                  >
                    <span>🚪</span> Logout
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          // Tampilkan tombol Login jika belum login
          <motion.button
            onClick={() => setOpenLogin(true)}
            className="glass-button px-4 py-2 rounded-full text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </motion.button>
        )}
      </header>

      {/* ======= MOBILE ======= */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 pt-4"
        data-aos="fade-down"
      >
        <div className="flex items-center justify-between rounded-full glass-card px-4 py-3">
          {/* Kiri = Brand yang sudah diperbarui */}
          <motion.div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => nav("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className="relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <img 
                src="/LogoPHI.png" 
                alt="Logo" 
                className="w-8 h-8 rounded-full border border-white/30 shadow-lg"
              />
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-sm opacity-30"></div>
            </motion.div>
            <div>
              <h1 className="text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                GameE4
              </h1>
            </div>
          </motion.div>

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

          {/* Kanan = Login/Profile - SESUAI STATUS LOGIN */}
          {currentUser ? (
            // Tampilkan menu Portfolio jika sudah login
            <motion.button
              onClick={() => nav(`/portfolio/${encodeURIComponent(currentUser.nama)}`)}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center"
              title={`Portfolio ${currentUser.nama}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-xs font-bold text-white">
                {currentUser.nama.charAt(0).toUpperCase()}
              </span>
            </motion.button>
          ) : (
            // Tampilkan tombol Login jika belum login
            <motion.button
              onClick={() => setOpenLogin(true)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              title="Login"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <img src="/user.svg" alt="User" className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </header>

      {/* Pop-up Login */}
      <AnimatePresence>
        {openLogin && (
          <LoginPopup 
            onClose={() => setOpenLogin(false)} 
            onLogin={handleLogin}
          />
        )}
      </AnimatePresence>
    </>
  );
}

