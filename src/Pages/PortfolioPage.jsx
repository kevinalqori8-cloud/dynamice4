import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { daftarSiswa } from "../data/siswa";
import { db } from "../firebase";
import { ref, get, set, push } from "firebase/database";

const defaultPict = "/AnonimUser.png";

export default function PortfolioPage() {
  const { nama } = useParams();
  const nav = useNavigate();
  const base = daftarSiswa.find((s) => s.nama === decodeURIComponent(nama));
  
  if (!base) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">🚫 Data siswa tidak ditemukan</div>
    </div>
  );

  // State management
  const [data, setData] = useState(() => {
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
  });

  const [edit, setEdit] = useState(false);
  const [money, setMoney] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = user.nama === base.nama;

  // Firebase references
  const MONEY_REF = ref(db, 'globalMoney');
  const TRANSACTIONS_REF = ref(db, 'transactions');

  useEffect(() => {
    loadMoney();
    loadTransactions();
  }, []);

  const loadMoney = async () => {
    try {
      const snapshot = await get(MONEY_REF);
      if (snapshot.exists()) {
        setMoney(snapshot.val());
      }
    } catch (error) {
      console.error("Error loading money:", error);
      const localMoney = parseInt(localStorage.getItem('globalMoney') || '1000');
      setMoney(localMoney);
    }
  };

  const loadTransactions = async () => {
    try {
      const snapshot = await get(TRANSACTIONS_REF);
      if (snapshot.exists()) {
        const allTransactions = snapshot.val();
        const userTransactions = Object.values(allTransactions)
          .filter(t => t.game)
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10);
        setTransactions(userTransactions);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  const save = () => {
    const { oldPass, newPass, ...clean } = data;
    localStorage.setItem(`portfolio_${base.nama}`, JSON.stringify(clean));
    setEdit(false);
    
    // Show success message
    showNotification("Profil berhasil disimpan!", "success");
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
    // Simple notification system
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
    return new Date(timestamp).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateLevel = () => {
    // Simple level calculation based on achievements and activity
    return Math.min(10, Math.floor((data.achievements?.length || 0) / 2) + 1);
  };

  const calculateProgress = () => {
    const level = calculateLevel();
    const nextLevel = level + 1;
    const currentExp = data.achievements?.length || 0;
    const requiredExp = nextLevel * 2;
    return (currentExp % 2) * 50; // Simple progress calculation
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
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
            className="ml-auto glass-button px-4 py-2 rounded-lg text-sm hover:bg-white/20 transition-all"
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
          <div className="glass-lonjong rounded-3xl p-8 mb-6">
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

                {/* Social Media */}
                <motion.div 
                  className="flex flex-wrap gap-3 mt-6 justify-center lg:justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1 }}
                >
                  {data.showWa && data.wa && (
                    <motion.a 
                      href={data.wa} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 transition-all"
                      whileHover={{ scale: 1.05 }}
                    >
                      <img src="/wa.svg" alt="WA" className="w-5 h-5" /> WhatsApp
                    </motion.a>
                  )}
                  {data.showIg && data.ig && (
                    <motion.a 
                      href={data.ig} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 transition-all"
                      whileHover={{ scale: 1.05 }}
                    >
                      <img src="/ig.svg" alt="IG" className="w-5 h-5" /> Instagram
                    </motion.a>
                  )}
                  {data.showTiktok && data.tiktok && (
                    <motion.a 
                      href={data.tiktok} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 transition-all"
                      whileHover={{ scale: 1.05 }}
                    >
                      <img src="/tiktok.svg" alt="TT" className="w-5 h-5" /> TikTok
                    </motion.a>
                  )}
                </motion.div>

                {/* Badges */}
                <motion.div 
                  className="flex flex-wrap gap-2 mt-6 justify-center lg:justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.1 }}
                >
                  {data.lencana?.map((badge) => (
                    <motion.span 
                      key={badge} 
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 text-sm font-medium backdrop-blur-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      🏆 {badge}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Money & Stats Card */}
          <div className="glass-lonjong rounded-3xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Money Display */}
              <div className="text-center">
                <motion.div 
                  className="text-4xl mb-2"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  💰
                </motion.div>
                <p className="text-white/60 text-sm mb-1">Saldo Global</p>
                <motion.p 
                  className="text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text"
                  key={money}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  Rp {money.toLocaleString()}
                </motion.p>
              </div>

              {/* Games Played */}
              <div className="text-center">
                <motion.div 
                  className="text-4xl mb-2"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  🎮
                </motion.div>
                <p className="text-white/60 text-sm mb-1">Game Dimainkan</p>
                <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                  {transactions.length}
                </p>
              </div>

              {/* Achievement Points */}
              <div className="text-center">
                <motion.div 
                  className="text-4xl mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ⭐
                </motion.div>
                <p className="text-white/60 text-sm mb-1">Poin Prestasi</p>
                <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text">
                  {(data.achievements?.length || 0) * 100}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {['profile', 'transactions', 'achievements'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {tab === 'profile' && '👤 Profil'}
                {tab === 'transactions' && '💸 Transaksi'}
                {tab === 'achievements' && '🏆 Prestasi'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'transactions' && (
              <motion.div 
                className="glass-lonjong rounded-3xl p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-xl font-bold mb-4 text-white">📊 Riwayat Transaksi</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.length > 0 ? (
                    transactions.map((transaction, i) => (
                      <motion.div 
                        key={i} 
                        className={`p-4 rounded-xl backdrop-blur-sm ${
                          transaction.moneyChange > 0 
                            ? 'bg-green-500/10 border border-green-500/20' 
                            : 'bg-red-500/10 border border-red-500/20'
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-white">
                              {transaction.game || 'Unknown Game'}
                            </p>
                            <p className="text-sm text-white/60">
                              {formatDate(transaction.timestamp)}
                            </p>
                          </div>
                          <div className={`text-lg font-bold ${
                            transaction.moneyChange > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.moneyChange > 0 ? '+' : ''}
                            Rp {Math.abs(transaction.moneyChange || 0).toLocaleString()}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-white/60">
                      <div className="text-4xl mb-2">📭</div>
                      <p>Belum ada transaksi</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div 
                className="glass-lonjong rounded-3xl p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-xl font-bold mb-4 text-white">🏆 Prestasi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.lencana?.map((badge, i) => (
                    <motion.div 
                      key={badge} 
                      className="p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🏆</div>
                        <div>
                          <p className="font-semibold text-white">{badge}</p>
                          <p className="text-sm text-white/60">Prestasi luar biasa</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Default achievements */}
                  <motion.div 
                    className="p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-green-500/30"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🎯</div>
                      <div>
                        <p className="font-semibold text-white">Member Aktif</p>
                        <p className="text-sm text-white/60">Bergabung sejak {formatDate(Date.parse(data.joinDate))}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Edit Sections */}
      {isOwner && edit && (
        <motion.div 
          className="px-6 pb-10 z-10 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="max-w-md mx-auto space-y-6">
            {/* Password Change */}
            <div className="glass-lonjong rounded-3xl p-6">
              <h3 className="font-semibold mb-4 text-white flex items-center gap-2">
                🔐 Ganti Password
              </h3>
              <input 
                name="oldPass" 
                value={data.oldPass || ""} 
                onChange={handleChange} 
                placeholder="Password lama" 
                type="password" 
                className="w-full bg-white/10 backdrop-blur-sm placeholder-white/60 px-4 py-3 rounded-xl mb-3 outline-none border border-white/20 text-white focus:border-purple-400 transition-colors" 
              />
              <input 
                name="newPass" 
                value={data.newPass || ""} 
                onChange={handleChange} 
                placeholder="Password baru" 
                type="password" 
                className="w-full bg-white/10 backdrop-blur-sm placeholder-white/60 px-4 py-3 rounded-xl mb-4 outline-none border border-white/20 text-white focus:border-purple-400 transition-colors" 
              />
              <motion.button 
                onClick={updatePassword} 
                className="w-full glass-button py-3 rounded-xl font-medium hover:bg-white/20 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Update Password
              </motion.button>
            </div>

            {/* Social Media */}
            <div className="glass-lonjong rounded-3xl p-6">
              <h3 className="font-semibold mb-4 text-white flex items-center gap-2">
                📱 Sosial Media
              </h3>
              {["wa", "ig", "tiktok"].map((key) => (
                <div key={key} className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize text-white/80">{key}</span>
                    <label className="flex items-center gap-2 text-xs text-white/60">
                      <input 
                        type="checkbox" 
                        name={`show${key.charAt(0).toUpperCase() + key.slice(1)}`} 
                        checked={data[`show${key.charAt(0).toUpperCase() + key.slice(1)}`]} 
                        onChange={handleChange} 
                        className="scale-75" 
                      />
                      Tampilkan
                    </label>
                  </div>
                  <input 
                    name={key} 
                    value={data[key]} 
                    onChange={handleChange} 
                    placeholder={`Link ${key}`} 
                    className="w-full bg-white/10 backdrop-blur-sm placeholder-white/60 px-4 py-3 rounded-xl outline-none border border-white/20 text-white focus:border-purple-400 transition-colors" 
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Custom CSS */}
      <style jsx>{`
        .glass-lonjong {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glass-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
