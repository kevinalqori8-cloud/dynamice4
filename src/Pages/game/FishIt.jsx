import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Button, Typography, Box, Paper, Dialog, DialogTitle, 
  DialogContent, DialogActions, Chip, LinearProgress 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../../hooks/useFirebaseData';
import { userService } from '../../service/firebaseService';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PhishingIcon from '@mui/icons-material/Phishing';
import UpgradeIcon from '@mui/icons-material/Upgrade';
// Di setiap game component, tambahkan ini:
import { safeCharAt, safeGet, safeCall } from '../SafeGameWrapper';

// Ganti semua: nama.charAt(0) 
// Menjadi: safeCharAt(nama, 0)

// Ganti semua: obj.properti.nested
// Menjadi: safeGet(obj, 'properti.nested', 'default')

// Ganti semua: functionCall()
// Menjadi: safeCall(functionCall)

const FISHING_ROD_LEVELS = [
  { level: 1, name: "Bamboo Rod", cost: 0, catchRate: 0.3, rareBonus: 1.0 },
  { level: 2, name: "Wooden Rod", cost: 500, catchRate: 0.5, rareBonus: 1.2 },
  { level: 3, name: "Steel Rod", cost: 1500, catchRate: 0.7, rareBonus: 1.5 },
  { level: 4, name: "Golden Rod", cost: 5000, catchRate: 0.85, rareBonus: 2.0 },
  { level: 5, name: "Diamond Rod", cost: 15000, catchRate: 0.95, rareBonus: 3.0 }
];

const FISH_DATA = [
  // Common Fish
  { id: 1, name: "Goldfish", rarity: "common", price: 10, chance: 0.3, icon: "🐠" },
  { id: 2, name: "Clownfish", rarity: "common", price: 15, chance: 0.25, icon: "🐟" },
  { id: 3, name: "Tuna", rarity: "common", price: 20, chance: 0.2, icon: "🐟" },
  
  // Uncommon Fish
  { id: 4, name: "Salmon", rarity: "uncommon", price: 50, chance: 0.15, icon: "🍣" },
  { id: 5, name: "Swordfish", rarity: "uncommon", price: 75, chance: 0.08, icon: "⚔️" },
  
  // Rare Fish
  { id: 6, name: "Shark", rarity: "rare", price: 200, chance: 0.03, icon: "🦈" },
  { id: 7, name: "Octopus", rarity: "rare", price: 300, chance: 0.02, icon: "🐙" },
  
  // Legendary Fish
  { id: 8, name: "Whale", rarity: "legendary", price: 1000, chance: 0.005, icon: "🐋" },
  { id: 9, name: "Kraken", rarity: "legendary", price: 5000, chance: 0.001, icon: "🦑" }
];

const FishIt = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  
  // Game states
  const [gameState, setGameState] = useState('idle'); // idle, fishing, caught, upgrade
  const [currentRod, setCurrentRod] = useState(1);
  const [totalEarned, setTotalEarned] = useState(0);
  const [caughtFish, setCaughtFish] = useState([]);
  const [fishingProgress, setFishingProgress] = useState(0);
  const [lastCaught, setLastCaught] = useState(null);
  
  const { data: userData } = useUserData(playerName || "guest");
  const money = userData?.money || 0;

  // Initialize
  useEffect(() => {
    const savedName = localStorage.getItem('fishit_player_name');
    if (savedName) {
      setPlayerName(savedName);
      setShowNameInput(false);
    } else {
      setShowNameInput(true);
    }
    
    const savedRod = parseInt(localStorage.getItem('fishit_rod_level') || '1');
    setCurrentRod(savedRod);
  }, []);

  const savePlayerName = async (name) => {
    if (!name.trim()) return;
    setPlayerName(name.trim());
    localStorage.setItem('fishit_player_name', name.trim());
    setShowNameInput(false);
    
    await userService.saveUserData(name.trim(), {
      nama: name.trim(),
      money: money || 1000,
      achievements: []
    });
  };

  // Fishing logic
  const startFishing = useCallback(() => {
    if (gameState === 'fishing') return;
    
    setGameState('fishing');
    setFishingProgress(0);
    setLastCaught(null);
    
    // Simulate fishing duration based on rod level
    const rod = FISHING_ROD_LEVELS.find(r => r.level === currentRod);
    const fishingDuration = 2000 + (Math.random() * 3000); // 2-5 seconds
    
    const fishingInterval = setInterval(() => {
      setFishingProgress(prev => {
        if (prev >= 100) {
          clearInterval(fishingInterval);
          completeFishing(rod);
          return 100;
        }
        return prev + (100 / (fishingDuration / 100));
      });
    }, 100);
  }, [gameState, currentRod]);

  const completeFishing = (rod) => {
    // Calculate catch based on rod stats
    const catchRoll = Math.random();
    
    if (catchRoll <= rod.catchRate) {
      // Successfully caught fish
      const fish = calculateFishCatch(rod);
      const earnedMoney = Math.floor(fish.price * rod.rareBonus);
      
      setCaughtFish(prev => [...prev, { ...fish, earned: earnedMoney }]);
      setTotalEarned(prev => prev + earnedMoney);
      setLastCaught({ fish, earned: earnedMoney });
      
      // Update user money
      if (playerName) {
        userService.updateMoney(playerName, money + earnedMoney);
      }
    } else {
      // Fish escaped
      setLastCaught({ fish: null, earned: 0 });
    }
    
    setGameState('caught');
  };

  const calculateFishCatch = (rod) => {
    const random = Math.random();
    let cumulativeChance = 0;
    
    // Sort fish by rarity and calculate weighted chances
    const weightedFish = FISH_DATA.map(fish => ({
      ...fish,
      weightedChance: fish.chance * rod.rareBonus
    }));
    
    for (const fish of weightedFish) {
      cumulativeChance += fish.weightedChance;
      if (random <= cumulativeChance) {
        return fish;
      }
    }
    
    // Default to common fish
    return FISH_DATA[0];
  };

  const upgradeRod = async () => {
    const nextRodLevel = currentRod + 1;
    const nextRod = FISHING_ROD_LEVELS.find(r => r.level === nextRodLevel);
    
    if (!nextRod) return;
    if (money < nextRod.cost) return;
    
    // Deduct money and upgrade
    if (playerName) {
      await userService.updateMoney(playerName, money - nextRod.cost);
      setCurrentRod(nextRodLevel);
      localStorage.setItem('fishit_rod_level', nextRodLevel.toString());
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 bg-gray-100';
      case 'uncommon': return 'text-green-600 bg-green-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'legendary': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex flex-col items-center justify-center p-4">
      
      {/* Name Input Modal */}
      <AnimatePresence>
        {showNameInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
            >
              <Typography variant="h5" className="text-center mb-4 font-bold">
                🎣 Fish It!
              </Typography>
              <Typography variant="body1" className="text-center mb-6">
                Masukkan nama Anda untuk mulai memancing!
              </Typography>
              <input
                type="text"
                placeholder="Nama Pemain"
                className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 text-center"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    savePlayerName(e.target.value.trim());
                  }
                }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  const input = document.querySelector('input');
                  if (input?.value.trim()) {
                    savePlayerName(input.value.trim());
                  }
                }}
                className="bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                Mulai Memancing
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      {playerName && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-4xl mb-4 flex justify-between items-center text-white"
        >
          <Button
            onClick={() => navigate(-1)}
            className="bg-white/20 backdrop-blur-sm"
          >
            ← Kembali
          </Button>
          <div className="text-center">
            <Typography variant="h4" className="font-bold">🎣 Fish It!</Typography>
            <Typography variant="body1">Total Earned: Rp {totalEarned.toLocaleString()}</Typography>
          </div>
          <div className="text-right">
            <Typography variant="body1">Player: {playerName}</Typography>
            <Typography variant="body1">Money: Rp {money.toLocaleString()}</Typography>
          </div>
        </motion.div>
      )}

      {/* Main Game Area */}
      {playerName && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative bg-gradient-to-b from-blue-300 to-blue-500 rounded-2xl overflow-hidden shadow-2xl p-8"
          style={{ width: 800, height: 600 }}
        >
          {/* Lake Scene */}
          <div className="absolute inset-0">
            {/* Sky */}
            <div className="h-2/3 bg-gradient-to-b from-sky-300 to-sky-400 relative">
              {/* Clouds */}
              <motion.div
                animate={{ x: [0, 100, 0] }}
                transition={{ duration: 20, repeat: Infinity }}
                className="absolute top-10 left-10 w-20 h-12 bg-white rounded-full opacity-70"
              />
              <motion.div
                animate={{ x: [0, -80, 0] }}
                transition={{ duration: 25, repeat: Infinity }}
                className="absolute top-20 right-20 w-16 h-10 bg-white rounded-full opacity-60"
              />
            </div>
            
            {/* Lake */}
            <div className="h-1/3 bg-gradient-to-b from-blue-500 to-blue-700 relative">
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-blue-600 opacity-50"
              />
            </div>
          </div>

          {/* Fishing Spot */}
          <div className="absolute bottom-20 left-10">
            <div className="bg-amber-600 w-32 h-16 rounded-lg flex items-center justify-center">
              <Typography className="text-white">🪑</Typography>
            </div>
            <Typography className="text-white text-center mt-2">{playerName}</Typography>
          </div>

          {/* Current Rod Info */}
          <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-4">
            <Typography variant="h6" className="mb-2">
              {FISHING_ROD_LEVELS.find(r => r.level === currentRod)?.name}
            </Typography>
            <Typography variant="body2">
              Catch Rate: {(FISHING_ROD_LEVELS.find(r => r.level === currentRod)?.catchRate * 100).toFixed(0)}%
            </Typography>
            <Typography variant="body2">
              Rare Bonus: {(FISHING_ROD_LEVELS.find(r => r.level === currentRod)?.rareBonus).toFixed(1)}x
            </Typography>
          </div>

          {/* Fishing Progress */}
          {gameState === 'fishing' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50"
            >
              <div className="bg-white rounded-2xl p-8 text-center max-w-md">
                <PhishingIcon className="text-6xl text-blue-500 mb-4 animate-bounce" />
                <Typography variant="h5" className="mb-4">Memancing...</Typography>
                <LinearProgress
                  variant="determinate"
                  value={fishingProgress}
                  className="mb-4 h-4"
                />
                <Typography variant="body2">
                  {fishingProgress.toFixed(0)}% - Sedang menunggu ikan...
                </Typography>
              </div>
            </motion.div>
          )}

          {/* Catch Result */}
          <AnimatePresence>
            {gameState === 'caught' && lastCaught && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center bg-black/50"
              >
                <div className="bg-white rounded-2xl p-8 text-center max-w-md">
                  {lastCaught.fish ? (
                    <>
                      <div className="text-6xl mb-4">{lastCaught.fish.icon}</div>
                      <Typography variant="h5" className="mb-2">
                        {lastCaught.fish.name}
                      </Typography>
                      <Chip
                        label={lastCaught.fish.rarity}
                        className={`mb-4 ${getRarityColor(lastCaught.fish.rarity)}`}
                      />
                      <Typography variant="h6" className="text-green-600 mb-4">
                        +Rp {lastCaught.earned.toLocaleString()}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <div className="text-6xl mb-4">💨</div>
                      <Typography variant="h5" className="mb-4">
                        Ikan Kabur!
                      </Typography>
                      <Typography variant="body1" className="text-gray-600">
                        Coba lagi dengan teknik yang lebih baik.
                      </Typography>
                    </>
                  )}
                  
                  <div className="flex gap-4 mt-6">
                    <Button
                      variant="contained"
                      onClick={startFishing}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500"
                    >
                      <PhishingIcon className="mr-2" />
                      Lanjut Memancing
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setGameState('idle')}
                    >
                      Selesai
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-4">
              <Button
                variant="contained"
                onClick={startFishing}
                disabled={gameState === 'fishing'}
                className="bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                <PhishingIcon className="mr-2" />
                {gameState === 'fishing' ? 'Memancing...' : 'Mulai Memancing'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => setGameState('upgrade')}
                className="bg-white/20 backdrop-blur-sm"
              >
                <UpgradeIcon className="mr-2" />
                Upgrade
              </Button>
            </div>
          </div>

          {/* Upgrade Modal */}
          <AnimatePresence>
            {gameState === 'upgrade' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 flex items-center justify-center z-40"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto"
                >
                  <Typography variant="h5" className="mb-4 text-center">
                    ⚡ Upgrade Pancingan
                  </Typography>
                  
                  <div className="space-y-4">
                    {FISHING_ROD_LEVELS.map((rod) => (
                      <div
                        key={rod.level}
                        className={`p-4 rounded-lg border-2 ${
                          rod.level === currentRod
                            ? 'border-green-500 bg-green-50'
                            : rod.level === currentRod + 1
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <Typography variant="h6">{rod.name}</Typography>
                            <Typography variant="body2">
                              Catch Rate: {(rod.catchRate * 100).toFixed(0)}% | 
                              Rare Bonus: {rod.rareBonus}x
                            </Typography>
                          </div>
                          <div className="text-right">
                            {rod.level <= currentRod ? (
                              <Chip label="Owned" color="success" />
                            ) : rod.level === currentRod + 1 ? (
                              <Button
                                variant="contained"
                                onClick={upgradeRod}
                                disabled={money < rod.cost}
                                className="bg-gradient-to-r from-green-500 to-blue-500"
                              >
                                Rp {rod.cost.toLocaleString()}
                              </Button>
                            ) : (
                              <Chip label="Locked" color="default" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <Button
                      variant="outlined"
                      onClick={() => setGameState('idle')}
                    >
                      Tutup
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Caught Fish Collection */}
      {playerName && caughtFish.length > 0 && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-4 bg-white/90 rounded-2xl p-4 max-w-4xl"
        >
          <Typography variant="h6" className="mb-3">🐟 Koleksi Ikan</Typography>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
            {caughtFish.slice(-8).map((fish, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-2 text-center"
              >
                <div className="text-2xl mb-1">{fish.icon}</div>
                <Typography variant="caption" className="block">
                  {fish.name}
                </Typography>
                <Typography variant="caption" className="text-green-600">
                  Rp {fish.earned.toLocaleString()}
                </Typography>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FishIt;

