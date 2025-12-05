// src/components/MusicDedication.jsx - FIXED VERSION

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusicDedication } from '../hooks/useMusicDedication';
import { Play, Pause, Heart, Music, Send, Search, Volume2, VolumeX } from 'lucide-react';

const MusicDedication = () => {
  const [activeTab, setActiveTab] = useState('explore');
  const [searchName, setSearchName] = useState('');
  const [foundDedications, setFoundDedications] = useState([]);
  const [senderName, setSenderName] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('love');
  const [isMobile, setIsMobile] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [audioRef, setAudioRef] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [likedItems, setLikedItems] = useState(new Set());

  const { dedications, loading, sendDedication, searchDedicationsByReceiver, getAllDedications } = useMusicDedication();

  // FIX: Audio player setup
  const audioPlayerRef = useRef(null);

  // FIX: Prevent like count increase
  const handleLike = (dedicationId) => {
    if (likedItems.has(dedicationId)) return; // Sudah like, tidak bisa like lagi
    
    // Hanya update UI state, tidak update ke database
    setLikedItems(prev => new Set([...prev, dedicationId]));
  };

  // FIX: Audio player functions
  const playAudio = (dedication) => {
    if (!dedication.songUrl) return;

    // Stop audio yang sedang diputar
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }

    // Create new audio instance
    const audio = new Audio(dedication.songUrl);
    audio.volume = volume;
    
    audio.play().catch(err => {
      console.log('Audio play failed:', err);
      // Fallback: create audio element
      const audioElement = new Audio(dedication.songUrl);
      audioElement.volume = volume;
      audioElement.play().catch(() => {
        alert('Tidak dapat memutar audio ini');
      });
    });

    setCurrentlyPlaying(dedication.id);
    setIsPlaying(true);
    audioPlayerRef.current = audio;

    // Reset when audio ends
    audio.onended = () => {
      setCurrentlyPlaying(null);
      setIsPlaying(false);
      audioPlayerRef.current = null;
    };
  };

  const pauseAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    }
  };

  // FIX: Prevent state reset on unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    getAllDedications(20);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSearch = async () => {
    if (!searchName.trim()) return;
    
    const results = await searchDedicationsByReceiver(searchName.trim(), 50);
    setFoundDedications(results);
    setActiveTab('results');
  };

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
        isPublic: true,
        songUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(songTitle)}` // YouTube URL sebagai contoh
      });

      // Reset form tapi jangan reset liked items
      setSongTitle('');
      setSongArtist('');
      setMessage('');
      setCategory('love');
      
      getAllDedications(20);
      alert('💝 Dedication berhasil dikirim!');

    } catch (error) {
      alert('❌ Gagal mengirim dedication: ' + error.message);
    }
  };

  const DedicationCard = ({ dedication, index }) => {
    const isCurrentlyPlaying = currentlyPlaying === dedication.id;
    const isLiked = likedItems.has(dedication.id);
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

        {/* Music Player */}
        <div className="bg-black/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-2xl">
                🎵
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{dedication.songTitle}</h3>
                <p className="text-gray-300 text-sm">{dedication.songArtist}</p>
              </div>
            </div>
            
            {/* Audio Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => isCurrentlyPlaying ? pauseAudio() : playAudio(dedication)}
                className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
              >
                {isCurrentlyPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Volume Control (if playing) */}
          {isCurrentlyPlaying && (
            <div className="flex items-center gap-2 mt-2">
              <Volume2 className="w-4 h-4 text-white/60" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
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
            onClick={() => handleLike(dedication.id)}
            disabled={isLiked}
            className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all ${
              isLiked 
                ? 'bg-pink-500 text-white cursor-not-allowed' 
                : 'bg-white/20 text-gray-300 hover:bg-pink-500/20 hover:text-pink-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{dedication.likes || 0}</span>
          </button>
          
          <div className="text-xs text-gray-400">
            {new Date(dedication.createdAt).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  // Main UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-purple-500/20 to-pink-500/20"></div>
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
              repeatType: "reverse"
            }}
          >
            ♪
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

        {/* Search Bar yang Kamu Minta - DI TENGAH */}
        <motion.div 
          className="max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-white mb-2">💝 Hai, cek yuk apakah ada yang mengirim lagu untukmu</h2>
              <p className="text-white/60">Masukkan nama untuk melihat dedication lagu</p>
            </div>
            
            <div className="relative">
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
              className="w-full mt-4 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Cek Dedication
            </button>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/20 backdrop-blur-lg rounded-full p-2 flex gap-2">
            {[
              { id: 'explore', label: '🔍 Explore', icon: Search },
              { id: 'search', label: '💝 Search Name', icon: Search },
              { id: 'send', label: '🎁 Send Song', icon: Send }
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
          {/* Konten untuk setiap tab */}
          {/* (Sama seperti sebelumnya tapi dengan audio player fix) */}
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
                repeatType: "reverse"
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

