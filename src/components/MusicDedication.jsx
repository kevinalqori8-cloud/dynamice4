// MusicDedication.jsx - INTEGRATED VERSION
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Heart, Music, Send, Search, Volume2, VolumeX } from 'lucide-react';
import { collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [likedItems, setLikedItems] = useState(new Set());
  const [dedications, setDedications] = useState([]);
  const [loading, setLoading] = useState(false);

  const audioPlayerRef = useRef(null);

  // INTEGRASI DENGAN API MUSIK GRATIS
  const searchSongs = async (query) => {
    if (!query.trim()) return [];
    
    try {
      // Primary: Deezer API (gratis)
      const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.data) {
        return data.data.map(track => ({
          id: track.id,
          title: track.title,
          artist: track.artist.name,
          album: track.album.title,
          preview: track.preview,
          image: track.album.cover_medium,
          url: track.link
        }));
      }
    } catch (error) {
      console.error('Error searching songs:', error);
    }
    
    return [];
  };

  // Firebase operations
  const getAllDedications = async (limitCount = 20) => {
    try {
      const q = query(
        collection(db, 'musicDedications'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const dedicationList = [];
      querySnapshot.forEach((doc) => {
        dedicationList.push({ id: doc.id, ...doc.data() });
      });
      
      setDedications(dedicationList);
    } catch (error) {
      console.error('Error getting dedications:', error);
    }
  };

  const searchDedicationsByReceiver = async (receiverName, limitCount = 50) => {
    try {
      const q = query(
        collection(db, 'musicDedications'),
        where('receiverName', '==', receiverName),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      
      return results;
    } catch (error) {
      console.error('Error searching dedications:', error);
      return [];
    }
  };

  const sendDedication = async (dedicationData) => {
    try {
      await addDoc(collection(db, 'musicDedications'), {
        ...dedicationData,
        likes: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending dedication:', error);
      throw error;
    }
  };

  // Audio functions
  const playAudio = (dedication) => {
    if (!dedication.preview) return;

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }

    const audio = new Audio(dedication.preview);
    audio.volume = volume;
    
    audio.play().catch(err => {
      console.log('Audio play failed:', err);
      alert('Tidak dapat memutar audio ini');
    });

    setCurrentlyPlaying(dedication.id);
    setIsPlaying(true);
    audioPlayerRef.current = audio;

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

  // Like function (FIXED - tidak akan nambah di database)
  const handleLike = (dedicationId) => {
    if (likedItems.has(dedicationId)) return;
    
    // Hanya update local state, tidak update database
    setLikedItems(prev => new Set([...prev, dedicationId]));
  };

  // Initialize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    getAllDedications(20);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  // Song search component
  const SongSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const handleSongSearch = async () => {
      if (!searchQuery.trim()) return;
      
      setSearching(true);
      const results = await searchSongs(searchQuery);
      setSearchResults(results);
      setSearching(false);
    };

    const selectSong = (song) => {
      setSongTitle(song.title);
      setSongArtist(song.artist);
      setSearchResults([]);
      setSearchQuery('');
    };

    return (
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari lagu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/30 focus:border-pink-400 focus:outline-none"
          />
          <button
            onClick={handleSongSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-white/60 hover:text-white"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
        
        {searching && <div className="text-white/60 mt-2">Mencari...</div>}
        
        {searchResults.length > 0 && (
          <div className="mt-2 bg-black/30 rounded-lg max-h-40 overflow-y-auto">
            {searchResults.map(song => (
              <div
                key={song.id}
                className="p-3 hover:bg-white/10 cursor-pointer text-white"
                onClick={() => selectSong(song)}
              >
                <div className="font-semibold">{song.title}</div>
                <div className="text-sm text-white/60">{song.artist}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Dedication card component
  const DedicationCard = ({ dedication, index }) => {
    const isCurrentlyPlaying = currentlyPlaying === dedication.id;
    const isLiked = likedItems.has(dedication.id);
    const senderInitial = dedication.senderName?.charAt(0).toUpperCase() || '?';
    const receiverInitial = dedication.receiverName?.charAt(0).toUpperCase() || '?';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300"
      >
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

        {dedication.message && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 mb-4">
            <p className="text-white text-sm italic">"{dedication.message}"</p>
          </div>
        )}

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
            {dedication.createdAt?.toDate ? 
              new Date(dedication.createdAt.toDate()).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 
              new Date().toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            }
          </div>
        </div>
      </motion.div>
    );
  };

  // Main UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 relative overflow-hidden">
      <div className="fixed inset-0">
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

        <AnimatePresence mode="wait">
          {activeTab === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-white mb-6 text-center">✨ Dedication Terbaru</h2>
              <div className="grid gap-6">
                {dedications.map((dedication, index) => (
                  <DedicationCard key={dedication.id} dedication={dedication} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-white mb-6 text-center">🔍 Hasil Pencarian untuk "{searchName}"</h2>
              <div className="grid gap-6">
                {foundDedications.map((dedication, index) => (
                  <DedicationCard key={dedication.id} dedication={dedication} index={index} />
                ))}
              </div>
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
              <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">🎁 Kirim Dedication</h2>
                
                <SongSearch />
                
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nama kamu..."
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/30 focus:border-pink-400 focus:outline-none"
                  />
                  
                  <input
                    type="text"
                    placeholder="Nama orang yang ingin kamu kirimi lagu..."
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/30 focus:border-pink-400 focus:outline-none"
                  />
                  
                  <input
                    type="text"
                    placeholder="Judul lagu..."
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/30 focus:border-pink-400 focus:outline-none"
                  />
                  
                  <input
                    type="text"
                    placeholder="Artis..."
                    value={songArtist}
                    onChange={(e) => setSongArtist(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/30 focus:border-pink-400 focus:outline-none"
                  />
                  
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/30 focus:border-pink-400 focus:outline-none"
                  >
                    <option value="love">💕 Love</option>
                    <option value="friendship">👫 Friendship</option>
                    <option value="family">👨‍👩‍👧‍👦 Family</option>
                    <option value="inspiration">✨ Inspiration</option>
                    <option value="apology">🙏 Apology</option>
                    <option value="celebration">🎉 Celebration</option>
                  </select>
                  
                  <textarea
                    placeholder="Pesan kamu..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/30 focus:border-pink-400 focus:outline-none resize-none"
                  />
                  
                  <button
                    onClick={async () => {
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
                          preview: null // Bisa ditambahkan dari hasil pencarian
                        });
                        
                        setSongTitle('');
                        setSongArtist('');
                        setMessage('');
                        setCategory('love');
                        getAllDedications(20);
                        alert('💝 Dedication berhasil dikirim!');
                      } catch (error) {
                        alert('❌ Gagal mengirim dedication: ' + error.message);
                      }
                    }}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Kirim Dedication
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MusicDedication;

