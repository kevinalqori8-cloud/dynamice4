// src/Pages/game/FIXED_FishIt.jsx (Contoh Fix untuk FishIt)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSafeGame } from '../../hooks/useSafeGame';
import { MobileGameController, useTouchControls } from '../../components/MobileGameController';

// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const FISH_TYPES = [
  { emoji: '🐟', points: 10, speed: 2, size: 30 },
  { emoji: '🐠', points: 20, speed: 3, size: 25 },
  { emoji: '🦈', points: 50, speed: 1, size: 40 },
  { emoji: '🐡', points: 15, speed: 2.5, size: 28 },
];

const FishItGame = () => {
  const navigate = useNavigate();
  const { safeLocalStorage, safeNavigate, safeGet } = useSafeGame();
  const gameAreaRef = useRef(null);
  const [gameState, setGameState] = useState('ready'); // ready, playing, paused, completed
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [hook, setHook] = useState({ x: GAME_WIDTH / 2, y: 50, cast: false, reeling: false });
  const [fishes, setFishes] = useState([]);
  const [caughtFish, setCaughtFish] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Initialize game
  useEffect(() => {
    const savedName = safeLocalStorage.getItem('gamehub_player_name', '');
    if (savedName) {
      setPlayerName(savedName);
    }
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Game timer
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('completed');
    }
  }, [gameState, timeLeft]);

  // Spawn fishes
  useEffect(() => {
    if (gameState === 'playing') {
      const spawnFish = () => {
        const newFish = {
          id: Date.now() + Math.random(),
          x: Math.random() * (GAME_WIDTH - 100) + 50,
          y: Math.random() * (GAME_HEIGHT - 200) + 150,
          type: FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)],
          direction: Math.random() > 0.5 ? 1 : -1,
          speed: 1 + Math.random() * 2,
        };
        setFishes(prev => [...prev, newFish]);
      };

      const interval = setInterval(spawnFish, 2000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Move fishes
  useEffect(() => {
    if (gameState === 'playing') {
      const moveFishes = () => {
        setFishes(prev => prev.map(fish => ({
          ...fish,
          x: fish.x + fish.direction * fish.speed,
          direction: fish.x <= 0 || fish.x >= GAME_WIDTH - 50 ? -fish.direction : fish.direction,
        })).filter(fish => fish.x > -100 && fish.x < GAME_WIDTH + 100));
      };

      const interval = setInterval(moveFishes, 50);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Game controls
  const handleCast = useCallback((targetX) => {
    if (gameState !== 'playing' || hook.cast) return;

    setHook(prev => ({ ...prev, cast: true, x: targetX }));
    
    // Check for fish catch
    setTimeout(() => {
      const caught = fishes.find(fish => 
        Math.abs(fish.x - targetX) < 50 && Math.abs(fish.y - hook.y) < 50
      );
      
      if (caught) {
        setCaughtFish(caught);
        setFishes(prev => prev.filter(f => f.id !== caught.id));
        setScore(prev => prev + caught.type.points);
        
        // Reel in
        setHook(prev => ({ ...prev, reeling: true }));
        setTimeout(() => {
          setHook(prev => ({ ...prev, cast: false, reeling: false }));
          setCaughtFish(null);
        }, 1000);
      } else {
        setHook(prev => ({ ...prev, cast: false }));
      }
    }, 1000);
  }, [gameState, hook, fishes]);

  // Mouse controls
  const handleGameAreaClick = (e) => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * GAME_WIDTH;
    handleCast(x);
  };

  // Touch controls
  const touchControls = useTouchControls(
    () => handleCast(hook.x), // up
    () => {}, // down
    () => handleCast(hook.x - 50), // left
    () => handleCast(hook.x + 50) // right
  );

  // Start game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
    setFishes([]);
    setHook({ x: GAME_WIDTH / 2, y: 50, cast: false, reeling: false });
  };

  // Save score
  const saveScore = async () => {
    if (playerName && score > 0) {
      try {
        // Import userService dynamically
        const { userService } = await import('../../service/firebaseService');
        await userService.updateUserData(playerName, {
          fishingScore: score,
          fishingHighScore: Math.max(score, safeGet(userData, 'fishingHighScore', 0))
        });
      } catch (error) {
        console.warn('Could not save to Firebase:', error);
      }
    }
  };

  useEffect(() => {
    if (gameState === 'completed') {
      saveScore();
    }
  }, [gameState]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-600 to-blue-800 relative overflow-hidden">
      {/* Ocean Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-900 opacity-50"></div>
      
      {/* Game UI */}
      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 text-white">
          <div>
            <h1 className="text-3xl font-bold">🎣 Fish It!</h1>
            <p className="text-sm">Player: {playerName || 'Guest'}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">Score: {score}</p>
            <p className="text-sm">Time: {timeLeft}s</p>
          </div>
        </div>

        {/* Game Area */}
        <div 
          ref={gameAreaRef}
          className="relative mx-auto bg-gradient-to-b from-blue-400 to-blue-900 rounded-lg overflow-hidden cursor-crosshair"
          style={{ width: '100%', maxWidth: '800px', height: '500px' }}
          onClick={handleGameAreaClick}
          {...(isMobile ? touchControls : {})}
        >
          {/* Ocean floor */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-yellow-600 to-transparent"></div>
          
          {/* Hook */}
          <AnimatePresence>
            {hook.cast && (
              <motion.div
                className="absolute w-2 bg-gray-800"
                style={{ left: hook.x, top: 0, height: hook.y }}
                initial={{ height: 0 }}
                animate={{ height: hook.y }}
                exit={{ height: 0 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>

          {/* Hook head */}
          <motion.div
            className="absolute w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-white"
            style={{ left: hook.x - 12, top: hook.y - 12 }}
            animate={{ y: hook.cast ? [0, 20, 0] : 0 }}
            transition={{ duration: 1, repeat: hook.cast ? Infinity : 0 }}
          >
            🪝
          </motion.div>

          {/* Fishes */}
          <AnimatePresence>
            {fishes.map(fish => (
              <motion.div
                key={fish.id}
                className="absolute flex items-center justify-center"
                style={{ 
                  left: fish.x, 
                  top: fish.y,
                  width: fish.type.size,
                  height: fish.type.size
                }}
                animate={{ x: fish.direction * 20 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
              >
                <span className="text-2xl">{fish.type.emoji}</span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Caught fish */}
          <AnimatePresence>
            {caughtFish && hook.reeling && (
              <motion.div
                className="absolute flex items-center justify-center text-3xl"
                style={{ left: hook.x - 15, top: hook.y - 15 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                {caughtFish.type.emoji}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="mt-4 text-center">
          {gameState === 'ready' && (
            <button
              onClick={startGame}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition-colors"
            >
              🎣 Start Fishing!
            </button>
          )}

          {gameState === 'completed' && (
            <div className="bg-white/20 backdrop-blur-lg rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">🎣 Time's Up!</h2>
              <p className="text-xl mb-4">Score: {score}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={startGame}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate('/game')}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Back to Games
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Controls */}
      {isMobile && gameState === 'playing' && (
        <MobileGameController
          onLeft={() => handleCast(hook.x - 50)}
          onRight={() => handleCast(hook.x + 50)}
          onAction={() => handleCast(hook.x)}
          actionText="🎣 Cast"
        />
      )}
    </div>
  );
};

export default FishItGame;

