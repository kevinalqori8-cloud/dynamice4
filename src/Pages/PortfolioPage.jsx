import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { daftarSiswa } from "../data/siswa";
import { useUserData, useTransactions } from '../hooks/useFirebaseData';
import { userService } from '../service/firebaseService';

const defaultPict = "/AnonimUser.png";

export default function PortfolioPage() {
  const { nama } = useParams();
  const nav = useNavigate();
  
  // FIXED: Better error handling
  if (!nama) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">❌ Parameter tidak valid</h2>
          <button onClick={() => nav(-1)} className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg">
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  let decodedNama;
  try {
    decodedNama = decodeURIComponent(nama);
  } catch (error) {
    decodedNama = nama;
  }

  const base = daftarSiswa.find((s) => s.nama === decodedNama);
  
  if (!base) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center p-6">
          <h2 className="text-2xl font-bold mb-4">❌ Data siswa tidak ditemukan</h2>
          <p className="text-white/70 mb-4">Nama: {decodedNama}</p>
          <button onClick={() => nav(-1)} className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg">
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  // FIXED: Gunakan Firebase hooks
  const { data: userData, loading, error, updateData, updateMoney } = useUserData(base.nama);
  const { transactions, loading: transactionsLoading, addTransaction } = useTransactions(base.nama);
  
  const [edit, setEdit] = useState(false);
  const [data, setData] = useState(() => {
    const raw = localStorage.getItem(`portfolio_${base.nama}`);
    return raw ? JSON.parse(raw) : {
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

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = user.nama === base.nama;

  // FIXED: Sync local data dengan Firebase
  useEffect(() => {
    if (userData) {
      // Update local state dengan Firebase data
      setData(prev => ({
        ...prev,
        money: userData.money || 1000,
        achievements: userData.achievements || []
      }));
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((d) => ({ ...d, [name]: type === "checkbox" ? checked : value }));
  };

  const save = async () => {
    try {
      // Save ke localStorage
      const { oldPass, newPass, ...clean } = data;
      localStorage.setItem(`portfolio_${base.nama}`, JSON.stringify(clean));
      
      // Save ke Firebase
      await updateData({
        nama: data.nama,
        jurusan: data.jurusan,
        foto: data.foto,
        bio: data.bio,
        wa: data.wa,
        ig: data.ig,
        tiktok: data.tiktok,
        showWa: data.showWa,
        showIg: data.showIg,
        showTiktok: data.showTiktok,
        lencana: data.lencana,
        achievements: data.achievements,
        joinDate: data.joinDate
      });
      
      setEdit(false);
      showNotification("Profil berhasil disimpan!", "success");
    } catch (error) {
      console.error("Error saving:", error);
      showNotification("Gagal menyimpan!", "error");
    }
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
    return new Date(timestamp).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateLevel = () => {
    return Math.min(10, Math.floor((data.achievements?.length || 0) / 2) + 1);
  };

  const calculateProgress = () => {
    const level = calculateLevel();
    const currentExp = data.achievements?.length || 0;
    return (currentExp % 2) * 50;
  };

  // FIXED: Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // FIXED: Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">❌ Error Loading Profile</h2>
          <p className="text-white/70 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg">
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
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
          {/* Hero Card dengan Firebase Data */}
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
              </div>

              {/* Info Section */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                  {data.nama}
                </h2>
                <p className="text-2xl text-white/70 mt-1">
                  {data.jurusan}
                </p>

                {/* Level & Progress */}
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">Level</span>
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                      {calculateLevel()}
                    </span>
                  </div>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                      style={{ width: `${calculateProgress()}%` }}
                    />
                  </div>
                </div>

                {/* Money Display dari Firebase */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="text-2xl">💰</div>
                  <div>
                    <p className="text-white/60 text-sm">Saldo</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      Rp {userData?.money?.toLocaleString() || money.toLocaleString()}
                    </p>
                  </div>
                </div>

                <p className="mt-6 text-white/80 leading-relaxed text-lg">
                  {data.bio}
                </p>
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

          {/* Recent Transactions */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-4">📊 Transaksi Terakhir</h3>
            {transactionsLoading ? (
              <p className="text-white/60">Loading transactions...</p>
            ) : transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{transaction.game || 'Unknown Game'}</p>
                      <p className="text-white/60 text-sm">{formatDate(transaction.timestamp)}</p>
                    </div>
                    <p className={`font-bold ${transaction.moneyChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.moneyChange > 0 ? '+' : ''}
                      Rp {Math.abs(transaction.moneyChange || 0).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60">Belum ada transaksi</p>
            )}
          </div>
        </div>
      </motion.section>
    </div>
  );
}

