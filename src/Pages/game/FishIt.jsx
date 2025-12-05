import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Typography, Box, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../../hooks/useFirebaseData';
import { userService } from '../../service/firebaseService';
import { useGameOptimization } from '../../hooks/useGameOptimization';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { SimpleNameInput, usePlayerName } from '../../components/Simple_Name_Input_Fix';

// 🎣 Enhanced FishIt Game - Fixed Name Input Issue
const FishIt = () => {
  const navigate = useNavigate();
  const { userData } = useUserData();
  const { playerName, saveName, nameLoaded } = usePlayerName();
  
  // Game optimization hook
  const { fps, isMobile, batterySaving, trackGameEvent } = useGameOptimization('fishit');
  
  // Game states
  const [gameState, setGameState] = useState('menu'); // menu, playing, completed, failed
  const [showNameInput, setShowNameInput] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Game variables
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  
  // Fishing mechanics
  const [fishes, setFishes] = useState([]);
  const [hook, setHook] = useState({ x: 400, y: 100, cast: false, reeling: false });
  const [caughtFish, setCaughtFish] = useState(null);
  const [bubbles, setBubbles] = useState([]);
  const [treasures, setTreasures] = useState([]);
  
  // Game settings
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const WATER_LEVEL = 350;
  
  // Fish types
  const fishTypes = [
    { name: 'Goldfish', emoji: '🐠', points: 10, speed: 2, rarity: 0.3, color: 'bg-orange-400' },
    { name: 'Tropical Fish', emoji: '🐟', points: 15, speed: 3, rarity: 0.2, color: 'bg-yellow-400' },
    { name: 'Shark', emoji: '🦈', points: 50, speed: 4, rarity: 0.05, color: 'bg-gray-600' },
    { name: 'Jellyfish', emoji: '🪼', points: 20, speed: 1, rarity: 0.15, color: 'bg-pink-400' },
    { name: 'Octopus', emoji: '🐙', points: 30, speed: 2, rarity: 0.1, color: 'bg-purple-400' },
    { name: 'Whale', emoji: '🐋', points: 100, speed: 1, rarity: 0.02, color: 'bg-blue-600' },
    { name: 'Pufferfish', emoji: '🐡', points: 25, speed: 2, rarity: 0.1, color: 'bg-green-400' },
    { name: 'Seahorse', emoji: '🦄', points: 40, speed: 1, rarity: 0.08, color: 'bg-indigo-400' }
  ];

  // Initialize game
  const initializeGame = useCallback(() => {
    if (!playerName) {
      setShowNameInput(true);
      return;
    }
    
    setGameState('playing');
    setScore(0);
    setTime(0);
    setLives(3);
    setCombo(0);
    setMaxCombo(0);
    setFishes([]);
    setHook({ x: GAME_WIDTH / 2, y: 100, cast: false, reeling: false });
    setCaughtFish(null);
    setBubbles([]);
    setTreasures([]);
    
    // Track game start
    trackGameEvent('game_start', { game: 'fishit', player: playerName });
  }, [playerName, trackGameEvent]);

  // Handle name submission
  const handleNameSubmit = (name) => {
    saveName(name);
    setShowNameInput(false);
    // Restart game setelah nama disimpan
    setTimeout(() => {
      initializeGame();
    }, 500);
  };

  // Cast fishing line
  const castLine = useCallback((targetX, targetY) => {
    if (hook.cast || hook.reeling || targetY < WATER_LEVEL) return;
    
    setHook(prev => ({
      ...prev,
      targetX: targetX,
      targetY: Math.min(targetY, GAME_HEIGHT - 50),
      cast: true,
      reeling: false
    }));
    
    trackGameEvent('cast_line', { game: 'fishit', x: targetX, y: targetY });
  }, [hook]);

  // Reel in
  const reelIn = useCallback(() => {
    if (!hook.cast || hook.reeling) return;
    
    setHook(prev => ({ ...prev, reeling: true }));
    
    // Check if fish is caught
    const nearbyFish = fishes.find(fish => 
      Math.abs(fish.x - hook.targetX) < 50 && 
      Math.abs(fish.y - hook.targetY) < 50
    );
    
    if (nearbyFish) {
      setCaughtFish(nearbyFish);
      setFishes(prev => prev.filter(f => f.id !== nearbyFish.id));
      
      // Calculate score with combo
      const points = nearbyFish.points * (1 + combo * 0.1);
      setScore(prev => prev + Math.floor(points));
      setCombo(prev => prev + 1);
      setMaxCombo(prev => Math.max(prev, combo + 1));
      
      trackGameEvent('fish_caught', { 
        game: 'fishit', 
        fish: nearbyFish.name, 
        points: Math.floor(points),
        combo: combo + 1 
      });
    } else {
      setCombo(0);
    }
  }, [hook, fishes, combo, trackGameEvent]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      setTime(prev => prev + 1);
      
      // Spawn fishes
      setFishes(prev => {
        let newFishes = prev.filter(fish => fish.x > -100 && fish.x < GAME_WIDTH + 100);
        
        if (Math.random() < 0.05) {
          const fishType = fishTypes.find(type => Math.random() < type.rarity) || fishTypes[0];
          newFishes.push({
            id: Date.now() + Math.random(),
            ...fishType,
            x: Math.random() < 0.5 ? -50 : GAME_WIDTH + 50,
            y: WATER_LEVEL + 50 + Math.random() * (GAME_HEIGHT - WATER_LEVEL - 100),
            direction: Math.random() < 0.5 ? 1 : -1
          });
        }
        
        return newFishes.map(fish => ({
          ...fish,
          x: fish.x + fish.speed * fish.direction,
          y: fish.y + Math.sin(time * 0.1 + fish.id) * 0.5
        }));
      });

      // Spawn bubbles
      setBubbles(prev => {
        let newBubbles = prev.filter(bubble => bubble.y > -20);
        
        if (Math.random() < 0.1) {
          newBubbles.push({
            id: Date.now(),
            x: Math.random() * GAME_WIDTH,
            y: GAME_HEIGHT,
            size: 5 + Math.random() * 10,
            speed: 1 + Math.random() * 2
          });
        }
        
        return newBubbles.map(bubble => ({
          ...bubble,
          y: bubble.y - bubble.speed,
          x: bubble.x + Math.sin(time * 0.05 + bubble.id) * 0.5
        }));
      });

      // Spawn treasures
      setTreasures(prev => {
        let newTreasures = prev.filter(treasure => treasure.collected === false);
        
        if (Math.random() < 0.005) {
          newTreasures.push({
            id: Date.now(),
            x: Math.random() * GAME_WIDTH,
            y: WATER_LEVEL + 100 + Math.random() * 100,
            emoji: '💎',
            points: 200,
            collected: false
          });
        }
        
        return newTreasures;
      });

      // Update hook
      setHook(prev => {
        if (!prev.cast) return prev;
        
        const dx = prev.targetX - prev.x;
        const dy = prev.targetY - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
          // Hook reached target
          if (prev.reeling) {
            // Reeling back
            return {
              ...prev,
              x: prev.x + (DINO_X - prev.x) * 0.1,
              y: prev.y + (100 - prev.y) * 0.1,
              cast: distance > 5
            };
          }
          return prev;
        }
        
        // Moving to target
        return {
          ...prev,
          x: prev.x + (dx / distance) * 10,
          y: prev.y + (dy / distance) * 10
        };
      });

      // Check treasure collection
      setTreasures(prev => prev.map(treasure => {
        if (treasure.collected) return treasure;
        
        const distance = Math.sqrt(
          Math.pow(treasure.x - hook.x, 2) + 
          Math.pow(treasure.y - hook.y, 2)
        );
        
        if (distance < 30 && hook.reeling) {
          setScore(s => s + treasure.points);
          trackGameEvent('treasure_collected', { game: 'fishit', points: treasure.points });
          return { ...treasure, collected: true };
        }
        
        return treasure;
      }));

      // Check game over
      if (lives <= 0) {
        setGameState('completed');
        trackGameEvent('game_over', { game: 'fishit', score, time });
      }
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameState, hook, lives, time, trackGameEvent]);

  // Save high score
  useEffect(() => {
    if (gameState === 'completed' && userData?.uid) {
      userService.addScore(userData.uid, 'fishit', score);
      
      // Save personal best
      const bestScore = localStorage.getItem(`fishit_best_${userData.uid}`);
      if (!bestScore || score > parseInt(bestScore)) {
        localStorage.setItem(`fishit_best_${userData.uid}`, score.toString());
      }
    }
  }, [gameState, score, userData]);

  // Handle clicks
  const handleGameClick = (e) => {
    if (gameState !== 'playing') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (!hook.cast) {
      castLine(x, y);
    } else if (hook.reeling) {
      // Do nothing, already reeling
    } else {
      reelIn();
    }
  };

  const resetGame = () => {
    setGameState('menu');
  };

  // Render menu
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        {/* Name Input Modal */}
        {showNameInput && (
          <SimpleNameInput 
            onNameSubmit={handleNameSubmit}
            gameName="🎣 FishIt"
          />
        )}
        
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              🎣 FishIt
            </motion.h1>
            <p className="text-xl text-gray-300">Gas berburu secret treasure di lautan!</p>
          </div>

          {/* Game Stats */}
          {userData && (
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 mb-8">
              <Typography variant="h6" className="mb-4 text-center">📊 Statistik Kamu</Typography>
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <div className="text-center">
                    <Typography variant="h4" className="text-blue-400">{userData.gameStats?.fishit?.gamesPlayed || 0}</Typography>
                    <Typography variant="body2" className="text-gray-400">Games Played</Typography>
                  </div>
                </Grid>
                <Grid item xs={4}>
                  <div className="text-center">
                    <Typography variant="h4" className="text-cyan-400">
                      {localStorage.getItem(`fishit_best_${userData.uid}`) || 0}
                    </Typography>
                    <Typography variant="body2" className="text-gray-400">Best Score</Typography>
                  </div>
                </Grid>
                <Grid item xs={4}>
                  <div className="text-center">
                    <Typography variant="h4" className="text-green-400">{maxCombo}</Typography>
                    <Typography variant="body2" className="text-gray-400">Max Combo</Typography>
                  </div>
                </Grid>
              </Grid>
            </div>
          )}

          {/* Fish Types Preview */}
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <Typography variant="h6" className="text-white text-center mb-4">🐠 Jenis Ikan</Typography>
            <Grid container spacing={2}>
              {fishTypes.slice(0, 6).map((fish) => (
                <Grid item xs={6} md={2} key={fish.name}>
                  <Paper className="bg-black/50 p-3 text-center">
                    <div className="text-2xl mb-1">{fish.emoji}</div>
                    <Typography variant="body2" className="text-white font-semibold">
                      {fish.name}
                    </Typography>
                    <Typography variant="caption" className="text-gray-400">
                      {fish.points} pts
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <Button
              variant="contained"
              size="large"
              onClick={initializeGame}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                '🎣 Mulai Memancing'
              )}
            </Button>
          </div>

          {/* Back Button */}
          <div className="text-center mt-4">
            <Button
              variant="outlined"
              onClick={() => navigate('/game')}
              className="text-white border-white hover:bg-white hover:text-blue-900"
            >
              ← Kembali ke Games
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render game
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900 p-4">
      {/* Name Input Modal */}
      {!nameLoaded && (
        <SimpleNameInput 
          onNameSubmit={handleNameSubmit}
          gameName="🎣 FishIt"
        />
      )}
      
      <div className="max-w-6xl mx-auto">
        {/* Game UI */}
        <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outlined"
              onClick={resetGame}
              className="text-white border-white hover:bg-white hover:text-blue-900"
              startIcon={<RefreshIcon />}
            >
              Menu
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <Typography variant="h6" className="text-blue-400">
                  Score: {score}
                </Typography>
              </div>
              <div className="text-center">
                <Typography variant="h6" className="text-cyan-400">
                  Combo: {combo}x
                </Typography>
              </div>
              <div className="text-center">
                <Typography variant="h6" className="text-red-400">
                  ❤️ {lives}
                </Typography>
              </div>
            </div>
            
            <Chip 
              label={`FPS: ${fps}`} 
              color={fps >= 50 ? "success" : fps >= 30 ? "warning" : "error"}
            />
          </div>
        </div>

        {/* Game Area */}
        <div 
          className="relative bg-gradient-to-b from-cyan-400 to-blue-600 rounded-2xl overflow-hidden cursor-crosshair"
          style={{ 
            height: GAME_HEIGHT,
            width: GAME_WIDTH,
            margin: '0 auto'
          }}
          onClick={handleGameClick}
        >
          {/* Water background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-300/30 to-blue-500/50" />
          
          {/* Bubbles */}
          {bubbles.map(bubble => (
            <div
              key={bubble.id}
              className="absolute rounded-full bg-white/30 border border-white/50"
              style={{
                left: bubble.x,
                top: bubble.y,
                width: bubble.size,
                height: bubble.size
              }}
            />
          ))}

          {/* Treasures */}
          {treasures.map(treasure => (
            <div
              key={treasure.id}
              className="absolute text-2xl animate-pulse"
              style={{
                left: treasure.x,
                top: treasure.y
              }}
            >
              {treasure.emoji}
            </div>
          ))}

          {/* Fishing line */}
          {hook.cast && (
            <svg className="absolute inset-0 pointer-events-none">
              <line
                x1={GAME_WIDTH / 2}
                y1={50}
                x2={hook.x}
                y2={hook.y}
                stroke="rgba(139, 69, 19, 0.8)"
                strokeWidth="2"
              />
              <circle
                cx={hook.x}
                cy={hook.y}
                r="8"
                fill="#8B4513"
              />
            </svg>
          )}

          {/* Fishes */}
          {fishes.map(fish => (
            <motion.div
              key={fish.id}
              className={`absolute rounded-full ${fish.color} flex items-center justify-center`}
              style={{
                left: fish.x - 20,
                top: fish.y - 20,
                width: 40,
                height: 40
              }}
              animate={{
                scaleX: fish.direction > 0 ? 1 : -1
              }}
              transition={{ duration: 0.1 }}
            >
              <span className="text-2xl">{fish.emoji}</span>
            </motion.div>
          ))}

          {/* Caught fish display */}
          {caughtFish && hook.reeling && (
            <motion.div
              className="absolute text-4xl"
              style={{
                left: hook.x - 20,
                top: hook.y - 20
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              {caughtFish.emoji}
            </motion.div>
          )}

          {/* Instructions */}
          <div className="absolute top-4 left-4 bg-black/50 rounded-lg p-3 text-white text-sm">
            <div>🖱️ Klik untuk casting</div>
            <div>🎣 Klik lagi untuk reel in</div>
            <div>💎 Kumpulkan harta karun!</div>
          </div>

          {/* Game Over Overlay */}
          <AnimatePresence>
            {gameState === 'completed' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center"
              >
                <div className="text-center bg-black/50 rounded-2xl p-8">
                  <div className="text-6xl mb-4">🎣</div>
                  <Typography variant="h4" className="text-white font-bold mb-2">
                    Time's Up!
                  </Typography>
                  <Typography variant="h6" className="text-gray-300 mb-4">
                    Score: {score} | Max Combo: {maxCombo}x
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={initializeGame}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                    startIcon={<RefreshIcon />}
                  >
                    Main Lagi
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Controls */}
        {isMobile && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Button
              variant="outlined"
              onClick={() => castLine(GAME_WIDTH / 2, GAME_HEIGHT / 2)}
              className="bg-black/30 text-white border-white/50 py-4"
            >
              🎣 Cast
            </Button>
            <Button
              variant="outlined"
              onClick={reelIn}
              className="bg-black/30 text-white border-white/50 py-4"
            >
              🔄 Reel In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FishIt;
