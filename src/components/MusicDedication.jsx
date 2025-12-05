// src/components/MusicDedication.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusicDedication } from '../hooks/useMusicDedication';
import { useSafeGame } from '../hooks/useSafeGame';
import { Play, Heart, Music, Send, Search, Gift } from 'lucide-react';

const MusicDedication = () => {
  const [activeTab, setActiveTab] = useState('explore'); // explore, search, send
  const [searchName, setSearchName] = useState('');
  const [foundDedications, setFoundDedications] = useState([]);
  const [senderName, setSenderName] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('love');
  const [isMobile, setIsMobile] = useState(false);

  const { dedications, loading, sendDedication, searchDedicationsByReceiver, getAllDedications, likeDedication } = useMusicDedication();
  const { safeLocalStorage } = useSafeGame();

  const categories = [
    { value: 'love', label: '💕 Love', color: 'from-pink-500 to-rose-500' },
    { value: 'friendship', label: '🤝 Friendship', color: 'from-blue-500 to-cyan-500' },
    { value: 'birthday', label: '🎂 Birthday', color: 'from-yellow-500 to-orange-500' },
    { value: 'motivation', label: '💪 Motivation', color: 'from-green-500 to-emerald-500' },
    { value: 'apology', label: '😔 Apology', color: 'from-purple-500 to-indigo-500' },
    { value: 'graduation', label: '🎓 Graduation', color: 'from-red-500 to-pink-500' },
    { value: 'other', label: '✨ Other', color: 'from-gray-500 to-slate-500' }
  ];

  // Initialize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Load dedications on mount
    getAllDedications(20);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchName.trim()) return;
    
    const results = await searchDedicationsByReceiver(searchName.trim(), 50);
    setFoundDedications(results);
    setActiveTab('results');
  };

  // Handle send dedication
  const handleSendDedication = async () => {
    if (!senderName.trim() || !receiverName.trim() || !songTitle.trim()) {
      alert('Mohon isi nama pengirim, penerima, dan judul lagu!');
      return;
    }

    try {
      await sendDedication({
        senderName: senderName.trim(),
        receiverName: receiverName.trim(),
        songTitle: songTitle.trim(),
        songArtist: songArtist.trim(),
        message: message.trim(),
        category: category,
        isPublic: true
      });

      // Reset form
      setSongTitle('');
      setSongArtist('');
      setMessage('');
      setCategory('love');
      
      // Reload dedications
      getAllDedications(20);
      alert('💝 Dedication berhasil dikirim!');

    } catch (error) {
      alert('❌ Gagal mengirim dedication: ' + error.message);
    }
  };

  // Dedication Card Component
  const DedicationCard = ({ dedication, index }) => {
    const [isLiked, setIsLiked] = useState(false);
    const senderInitial = dedication.senderName.charAt(0).toUpperCase();
    const receiverInitial = dedication.receiverName.charAt(0).toUpperCase();

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {senderInitial}
            </div>
            <div>
              <p className="text-white font-semibold">{dedication.senderName}</p>
              <p className="text-gray-400 text-sm">untuk {dedication.receiverName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-purple-400 capitalize">{dedication.category}</span>
          </div>
        </div>

        {/* Music Info */}
        <div className="bg-black/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-2xl">
              🎵
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">{dedication.songTitle}</h3>
              <p className="text-gray-300 text-sm">{dedication.songArtist}</p>
            </div>
            <button className="p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors">
              <Play className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Message */}
        {dedication.message && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 mb-4">
            <p className="text-white text-sm italic">"{dedication.message}"</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => likeDedication(dedication.id, 'current-user-id')}
            className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all ${
              isLiked 
                ? 'bg-pink-500 text-white' 
                : 'bg-white/20 text-gray-300 hover:bg-pink-500/20'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{dedication.likes || 0}</span>
          </button>
          
          <div className="text-xs text-gray-400">
            {new Date(dedication.createdAt).toLocaleDateString('id-ID')}
          </div>
        </div>
      </motion.div>
    );
  };

  // Main UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-purple-500/20 to-pink-500/20"></div>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 30 + 20}px`
            }}
            animate={{
              y: [-20, 20],
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            🎵
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            🎵 Music Dedication
          </h1>
          <p className="text-xl text-white/80 mb-6">
            Kirim lagu dan pesan untuk siapa pun! 💝
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/20 backdrop-blur-lg rounded-full p-2 flex gap-2">
            {[
              { id: 'explore', label: '🔍 Explore', icon: Search },
              { id: 'search', label: '💝 Search Name', icon: Search },
              { id: 'send', label: '🎁 Send Song', icon: Gift }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">🌟 Dedication Terbaru</h2>
                <p className="text-white/60">Lihat dedication lagu terbaru dari teman-teman!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dedications.map((dedication, index) => (
                  <DedicationCard key={dedication.id} dedication={dedication} index={index} />
                ))}
              </div>

              {dedications.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎵</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Belum ada dedication</h3>
                  <p className="text-white/60">Jadilah yang pertama mengirim dedication!</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">💝 Cek Dedication untukmu</h2>
                <p className="text-white/60">Masukkan nama untuk melihat dedication lagu</p>
              </div>

              <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="relative mb-6">
                  <input
                    type="text"
                    placeholder="Masukkan nama..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full px-6 py-4 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/30 focus:border-pink-400 focus:outline-none transition-all pr-12"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/60" />
                </div>

                <button
                  onClick={handleSearch}
                  disabled={!searchName.trim() || loading}
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Cek Dedication
                </button>
              </div>

              {/* Search Results */}
              {foundDedications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 space-y-4"
                >
                  <h3 className="text-xl font-bold text-white">
                    Dedication untuk "{searchName}" ({foundDedications.length})
                  </h3>
                  {foundDedications.map((dedication, index) => (
                    <DedicationCard key={dedication.id} dedication={dedication} index={index} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'send' && (
            <motion.div
              key="send"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">🎁 Kirim Dedication</h2>
                <p className="text-white/60">Kirim lagu dan pesan untuk seseorang!</p>
              </div>

              <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20 space-y-6">
                {/* Sender & Receiver */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Nama Kamu</label>
                    <input
                      type="text"
                      placeholder="Nama pengirim"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/30 focus:border-pink-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Untuk Siapa</label>
                    <input
                      type="text"
                      placeholder="Nama penerima"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/30 focus:border-pink-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Song Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Judul Lagu</label>
                    <div className="relative">
                      <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="text"
                        placeholder="Judul lagu"
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/30 focus:border-pink-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Artis</label>
                    <input
                      type="text"
                      placeholder="Nama artis"
                      value={songArtist}
                      onChange={(e) => setSongArtist(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/30 focus:border-pink-400 focus:outline-none"
                      />
                    </div>
                  </div>

                {/* Category */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Kategori</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`p-3 rounded-lg text-sm font-medium transition-all ${
                          category === cat.value
                            ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                            : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Pesan</label>
                  <textarea
                    placeholder="Tulis pesanmu di sini..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/30 focus:border-pink-400 focus:outline-none resize-none"
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendDedication}
                  disabled={!senderName.trim() || !receiverName.trim() || !songTitle.trim()}
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Kirim Dedication 💝
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  🎵 Hasil untuk "{searchName}"
                </h2>
                <p className="text-white/60">
                  {foundDedications.length} dedication ditemukan
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {foundDedications.map((dedication, index) => (
                  <DedicationCard key={dedication.id} dedication={dedication} index={index} />
                ))}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setFoundDedications([]);
                    setActiveTab('search');
                  }}
                  className="px-6 py-3 bg-black/30 backdrop-blur-lg text-white rounded-lg hover:bg-black/50 transition-all"
                >
                  🔍 Cari nama lain
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Music Notes */}
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 20 + 10}px`
              }}
              animate={{
                y: [-30, 30],
                x: [-20, 20],
                rotate: [0, 360]
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              ♪
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MusicDedication;

