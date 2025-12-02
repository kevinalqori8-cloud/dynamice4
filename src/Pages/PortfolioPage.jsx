import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { daftarSiswa } from "../data/siswa";

const defaultPict = "/AnononimUser.png";

export default function PortfolioPage() {
  const { nama } = useParams();
  const nav = useNavigate();
  
  // FIXED: Better error handling and null checking
  if (!nama) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">❌ Parameter tidak valid</h2>
          <button 
            onClick={() => nav(-1)} 
            className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg"
          >
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  // FIXED: Safer decode with try-catch
  let decodedNama;
  try {
    decodedNama = decodeURIComponent(nama);
  } catch (error) {
    console.error("Error decoding nama:", error);
    decodedNama = nama;
  }

  const base = daftarSiswa.find((s) => s.nama === decodedNama);
  
  if (!base) {
    console.log("Base not found for nama:", decodedNama);
    console.log("Available names:", daftarSiswa.map(s => s.nama));
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center p-6">
          <h2 className="text-2xl font-bold mb-4">❌ Data siswa tidak ditemukan</h2>
          <p className="text-white/70 mb-4">Nama: {decodedNama}</p>
          <button 
            onClick={() => nav(-1)} 
            className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg"
          >
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  // State management
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(`portfolio_${base.nama}`);
      return raw
        ? JSON.parse(raw)
        : {
            nama: base.nama,
            jurusan: base.jurusan,
            foto: defaultPict,
            bio: "Halo! Saya siswa kelas XE-4 yang aktif dan kreatif.",
            wa: "",
            ig: "",
            tiktok: "",
            showWa: true,
            showIg: true,
            showTiktok: true,
            lencana: base.lencana || [],
            oldPass: "",
            newPass: "",
            achievements: [],
            joinDate: new Date().toISOString(),
          };
    } catch (error) {
      console.error("Error parsing localStorage data:", error);
      return {
        nama: base.nama,
        jurusan: base.jurusan,
        foto: defaultPict,
        bio: "Halo! Saya siswa kelas XE-4 yang aktif dan kreatif.",
        wa: "",
        ig: "",
        tiktok: "",
        showWa: true,
        showIg: true,
        showTiktok: true,
        lencana: base.lencana || [],
        oldPass: "",
        newPass: "",
        achievements: [],
        joinDate: new Date().toISOString(),
      };
    }
  });

  const [edit, setEdit] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = user.nama === base.nama;

  // FIXED: Remove Firebase dependencies yang menyebabkan error
  // Gunakan localStorage untuk semua data
  const [money, setMoney] = useState(() => {
    return parseInt(localStorage.getItem('globalMoney') || '1000');
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error parsing transactions:", error);
      return [];
    }
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      console.log("Portfolio loaded for:", base.nama);
    }, 100);
    return () => clearTimeout(timer);
  }, [base.nama]);

  const save = () => {
    try {
      const { oldPass, newPass, ...clean } = data;
      localStorage.setItem(`portfolio_${base.nama}`, JSON.stringify(clean));
      setEdit(false);
      showNotification("Profil berhasil disimpan!", "success");
    } catch (error) {
      console.error("Error saving profile:", error);
      showNotification("Gagal menyimpan profil!", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((d) => ({ ...d, [name]: type === "checkbox" ? checked : value }));
  };

  const updatePassword = () => {
    if (data.oldPass !== base.password) {
      showNotification("Password lama salah!", "error");
      return;
    }
    if (!data.newPass) {
      showNotification("Password baru kosong!", "error");
      return;
    }
    
    const updatedBase = { ...base, password: data.newPass };
    localStorage.setItem(`portfolio_${base.nama}`, JSON.stringify({ ...data, password: data.newPass }));
    localStorage.setItem("user", JSON.stringify(updatedBase));
    showNotification("Password berhasil diubah!", "success");
    window.location.reload();
  };

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const formatDate = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const calculateLevel = () => {
    return Math.min(10, Math.floor((data.achievements?.length || 0) / 2) + 1);
  };

  const calculateProgress = () => {
    const level = calculateLevel();
    const currentExp = data.achievements?.length || 0;
    return (currentExp % 2) * 50;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <motion.header 
        className="flex items-center gap-4 p-6 z-10 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button 
          onClick={() => nav(-1)} 
          className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ←
        </motion.button>
        <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Portofolio Siswa
        </h1>
        {isOwner && (
          <motion.button 
            onClick={() => setEdit(!edit)} 
            className="ml-auto bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-lg text-sm hover:bg-white/20 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {edit ? "💾 Simpan" : "✏️ Edit"}
          </motion.button>
        )}
      </motion.header>

      {/* Profile Section */}
      <motion.section 
        className="px-6 pb-10 z-10 relative"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Hero Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-6">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Photo Section */}
              <div className="flex-shrink-0">
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <img 
                    src={data.foto} 
                    alt="Foto" 
                    className="w-48 h-48 rounded-3xl object-cover border-4 border-white/30 shadow-2xl"
                    onError={(e) => {
                      e.target.src = defaultPict;
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
                    🏆
                  </div>
                </motion.div>
                
                {isOwner && edit && (
                  <input
                    name="foto"
                    value={data.foto}
                    onChange={handleChange}
                    placeholder="URL foto"
                    className="w-full mt-4 bg-white/10 backdrop-blur-sm placeholder-white/60 px-4 py-3 rounded-xl outline-none border border-white/20 text-white focus:border-purple-400 transition-colors"
                  />
                )}
              </div>

              {/* Info Section */}
              <div className="flex-1 text-center lg:text-left">
                <motion.p 
                  className="text-lg text-white/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Hi, I'm
                </motion.p>
                <motion.h2 
                  className="text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mt-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  {data.nama}
                </motion.h2>
                <motion.p 
                  className="text-2xl text-white/70 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  {data.jurusan}
                </motion.p>

                {/* Level & Progress */}
                <motion.div 
                  className="mt-6 flex items-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">Level</span>
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                      {calculateLevel()}
                    </span>
                  </div>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateProgress()}%` }}
                      transition={{ duration: 1, delay: 0.8 }}
                    />
                  </div>
                </motion.div>

                {/* Bio */}
                {isOwner && edit ? (
                  <textarea
                    name="bio"
                    value={data.bio}
                    onChange={handleChange}
                    placeholder="Bio singkat"
                    rows="4"
                    className="w-full mt-6 bg-white/10 backdrop-blur-sm placeholder-white/60 px-4 py-3 rounded-xl outline-none border border-white/20 text-white focus:border-purple-400 transition-colors"
                  />
                ) : (
                  <motion.p 
                    className="mt-6 text-white/80 leading-relaxed text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                  >
                    {data.bio}
                  </motion.p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6 justify-center">
            <button
              onClick={() => nav(`/game/mines`)}
              className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg text-white font-semibold transition-colors"
            >
              🎮 Game Mines
            </button>
            {isOwner && (
              <button
                onClick={save}
                className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg text-white font-semibold transition-colors"
              >
                💾 Simpan Profil
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-white/60 text-sm">Saldo Game</p>
                <p className="text-2xl font-bold text-yellow-400">Rp {money.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Transaksi</p>
                <p className="text-2xl font-bold text-blue-400">{transactions.length}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Level</p>
                <p className="text-2xl font-bold text-purple-400">{calculateLevel()}</p>
              </div>
            </div>
          </div>

          {/* Edit Mode */}
          {isOwner && edit && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-semibold mb-4">✏️ Edit Profil</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={data.bio}
                    onChange={handleChange}
                    placeholder="Bio singkat"
                    rows="3"
                    className="w-full bg-white/10 placeholder-white/60 px-4 py-3 rounded-xl outline-none border border-white/20 text-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">WhatsApp</label>
                    <input
                      name="wa"
                      value={data.wa}
                      onChange={handleChange}
                      placeholder="Link WhatsApp"
                      className="w-full bg-white/10 placeholder-white/60 px-4 py-3 rounded-xl outline-none border border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Instagram</label>
                    <input
                      name="ig"
                      value={data.ig}
                      onChange={handleChange}
                      placeholder="Link Instagram"
                      className="w-full bg-white/10 placeholder-white/60 px-4 py-3 rounded-xl outline-none border border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">TikTok</label>
                    <input
                      name="tiktok"
                      value={data.tiktok}
                      onChange={handleChange}
                      placeholder="Link TikTok"
                      className="w-full bg-white/10 placeholder-white/60 px-4 py-3 rounded-xl outline-none border border-white/20 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
}

