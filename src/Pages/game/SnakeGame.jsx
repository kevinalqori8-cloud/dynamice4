import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Typography, Box, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../../hooks/useFirebaseData';
import { userService } from '../../service/firebaseService';
import { useGameOptimization } from '../../hooks/useGameOptimization';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// 🐍 Snake Game - Classic with Modern Twist
const SnakeGame = () => {
  const navigate = useNavigate();
  const { userData } = useUserData();
  const gameAreaRef = useRef(null);
  
  // Game optimization hook
  const { fps, isMobile, batterySaving, trackGameEvent } = useGameOptimization('snake');
  
  // Game states
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, completed, failed
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [time, setTime] = useState(0);
  
  // Snake
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [specialFood, setSpecialFood] = useState(null);
  const [obstacles, setObstacles] = useState([]);
  
  // Power-ups
  const [speedBoost, setSpeedBoost] = useState(false);
  const [ghostMode, setGhostMode] = useState(false);
  const [magnetMode, setMagnetMode] = useState(false);
  
  // Game settings
  const GRID_SIZE = 20;
  const CELL_SIZE = 30;
  const GAME_WIDTH = GRID_SIZE * CELL_SIZE;
  const GAME_HEIGHT = GRID_SIZE * CELL_SIZE;
  
  let gameSpeed = speedBoost ? 50 : 150 - level * 10;
  gameSpeed = Math.max(gameSpeed, 60);

  // Food types
  const foodTypes = [
    { emoji: '🍎', points: 10, color: 'bg-red-500', type: 'normal' },
    { emoji: '🍌', points: 15, color: 'bg-yellow-500', type: 'normal' },
    { emoji: '🍇', points: 20, color: 'bg-purple-500', type: 'normal' },
    { emoji: '🍊', points: 25, color: 'bg-orange-500', type: 'normal' },
    { emoji: '⭐', points: 50, color: 'bg-yellow-400', type: 'special' },
    { emoji: '💎', points: 100, color: 'bg-cyan-400', type: 'special' },
    { emoji: '⚡', points: 0, color: 'bg-blue-500', type: 'powerup', effect: 'speed' },
    { emoji: '👻', points: 0, color: 'bg-gray-500', type: 'powerup', effect: 'ghost' },
    { emoji: '🧲', points: 0, color: 'bg-green-500', type: 'powerup', effect: 'magnet' }
  ];

  // Initialize game
  const initializeGame = useCallback(() => {
    const startX = Math.floor(GRID_SIZE / 2);
    const startY = Math.floor(GRID_SIZE / 2);
    
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setTime(0);
    setSnake([{ x: startX, y: startY }]);
    setDirection({ x: 1, y: 0 });
    setFood(generateFoodPosition([{ x: startX, y: startY }]));
    setSpecialFood(null);
    setObstacles(generateObstacles(1));
    setSpeedBoost(false);
    setGhostMode(false);
    setMagnetMode(false);
    
    trackGameEvent('game_start', { game: 'snake' });
  }, [trackGameEvent]);

  // Generate random food position
  const generateFoodPosition = useCallback((currentSnake, currentObstacles = []) => {
    let newPosition;
    do {
      newPosition = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        ...foodTypes[Math.floor(Math.random() * 4)] // Normal food only
      };
    } while (
      currentSnake.some(segment => segment.x === newPosition.x && segment.y === newPosition.y) ||
      currentObstacles.some(obstacle => obstacle.x === newPosition.x && obstacle.y === newPosition.y)
    );
    
    return newPosition;
  }, []);

  // Generate obstacles
  const generateObstacles = useCallback((currentLevel) => {
    const obstacles = [];
    const obstacleCount = Math.min(currentLevel * 2, 10);
    
    for (let i = 0; i < obstacleCount; i++) {
      let obstacle;
      do {
        obstacle = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE)
        };
      } while (
        (obstacle.x >= 8 && obstacle.x <= 12 && obstacle.y >= 8 && obstacle.y <= 12) ||
        obstacles.some(obs => obs.x === obstacle.x && obs.y === obstacle.y)
      );
      
      obstacles.push(obstacle);
    }
    
    return obstacles;
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      
      let newDirection = direction;
      
      switch(e.code) {
        case 'ArrowUp':
        case 'KeyW':
          if (direction.y === 0) newDirection = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 'KeyS':
          if (direction.y === 0) newDirection = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'KeyA':
          if (direction.x === 0) newDirection = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'KeyD':
          if (direction.x === 0) newDirection = { x: 1, y: 0 };
          break;
        case 'Space':
          e.preventDefault();
          if (gameState === 'playing') {
            setGameState('paused');
          } else if (gameState === 'paused') {
            setGameState('playing');
          }
          break;
      }
      
      setDirection(newDirection);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, direction]);

  // Touch controls
  useEffect(() => {
    if (!isMobile) return;
    
    let touchStartX = 0;
    let touchStartY = 0;
    
    const handleTouchStart = (e) => {
      if (gameState !== 'playing') return;
      
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    };
    
    const handleTouchEnd = (e) => {
      if (gameState !== 'playing') return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 30 && direction.x === 0) {
          setDirection({ x: 1, y: 0 });
        } else if (deltaX < -30 && direction.x === 0) {
          setDirection({ x: -1, y: 0 });
        }
      } else {
        // Vertical swipe
        if (deltaY > 30 && direction.y === 0) {
          setDirection({ x: 0, y: 1 });
        } else if (deltaY < -30 && direction.y === 0) {
          setDirection({ x: 0, y: -1 });
        }
      }
    };

    const gameArea = gameAreaRef.current;
    if (gameArea) {
      gameArea.addEventListener('touchstart', handleTouchStart);
      gameArea.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
	// Update untuk menambahkan mobile controller di SnakeGame
// Sudah saya tambahkan di kode SpaceShooter di atas, tapi untuk SnakeGame:

// Tambahkan di return SnakeGame:
{isMobile && gameState === 'playing' && (
  <div className="fixed bottom-4 left-4 right-4 lg:hidden">
    <div className="flex justify-center gap-4">
      <button
        onClick={() => setDirection('LEFT')}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
      >
        ←
      </button>
      <button
        onClick={() => setDirection('UP')}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
      >
        ↑
      </button>
      <button
        onClick={() => setDirection('DOWN')}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
      >
        ↓
      </button>
      <button
        onClick={() => setDirection('RIGHT')}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
      >
        →
      </button>
    </div>
  </div>
)}

      if (gameArea) {
        gameArea.removeEventListener('touchstart', handleTouchStart);
        gameArea.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [gameState, isMobile, direction]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      setTime(prev => prev + 1);
      
      // Move snake
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };
        
        // Apply magnet effect
        if (magnetMode && food) {
          const dx = food.x - head.x;
          const dy = food.y - head.y;
          const distance = Math.abs(dx) + Math.abs(dy);
          
          if (distance <= 3) {
            if (Math.abs(dx) > Math.abs(dy)) {
              setDirection({ x: dx > 0 ? 1 : -1, y: 0 });
            } else {
              setDirection({ x: 0, y: dy > 0 ? 1 : -1 });
            }
          }
        }
        
        head.x += direction.x;
        head.y += direction.y;
        
        // Check wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          if (!ghostMode) {
            setGameState('failed');
            trackGameEvent('game_over', { game: 'snake', score, level });
            return prevSnake;
          }
          // Ghost mode - wrap around
          head.x = (head.x + GRID_SIZE) % GRID_SIZE;
          head.y = (head.y + GRID_SIZE) % GRID_SIZE;
        }
        
        // Check self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          if (!ghostMode) {
            setGameState('failed');
            trackGameEvent('game_over', { game: 'snake', score, level });
            return prevSnake;
          }
        }
        
        // Check obstacle collision
        if (obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
          if (!ghostMode) {
            setGameState('failed');
            trackGameEvent('game_over', { game: 'snake', score, level });
            return prevSnake;
          }
        }
        
        newSnake.unshift(head);
        
        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(prev => prev + food.points);
          setFood(generateFoodPosition(newSnake, obstacles));
          
          // Chance to spawn special food
          if (Math.random() < 0.1 && !specialFood) {
            setSpecialFood({
              ...generateFoodPosition(newSnake, obstacles),
              ...foodTypes[4 + Math.floor(Math.random() * 5)] // Special food or power-up
            });
          }
          
          // Level progression
          if (score + food.points > level * 100) {
            setLevel(prev => prev + 1);
            setObstacles(generateObstacles(level + 1));
            trackGameEvent('level_up', { game: 'snake', level: level + 1 });
          }
          
          trackGameEvent('food_eaten', { game: 'snake', foodType: food.type, points: food.points });
        } else {
          newSnake.pop();
        }
        
        // Check special food collision
        if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
          if (specialFood.type === 'special') {
            setScore(prev => prev + specialFood.points);
          } else if (specialFood.type === 'powerup') {
            applyPowerUp(specialFood.effect);
          }
          
          setSpecialFood(null);
          trackGameEvent('special_food_eaten', { game: 'snake', effect: specialFood.effect });
        }
        
        return newSnake;
      });
      
      // Update special food timer
      if (specialFood && time % 100 === 0) {
        setSpecialFood(null);
      }
      
    }, gameSpeed);

    return () => clearInterval(gameLoop);
  }, [gameState, direction, food, specialFood, obstacles, ghostMode, magnetMode, gameSpeed, score, level, trackGameEvent]);

  // Apply power-up effects
  const applyPowerUp = (effect) => {
    switch(effect) {
      case 'speed':
        setSpeedBoost(true);
        setTimeout(() => setSpeedBoost(false), 5000);
        break;
      case 'ghost':
        setGhostMode(true);
        setTimeout(() => setGhostMode(false), 8000);
        break;
      case 'magnet':
        setMagnetMode(true);
        setTimeout(() => setMagnetMode(false), 10000);
        break;
    }
  };

  // Save high score
  useEffect(() => {
    if (gameState === 'completed' && userData?.uid) {
      userService.addScore(userData.uid, 'snake', score);
      
      const bestScore = localStorage.getItem(`snake_best_${userData.uid}`);
      if (!bestScore || score > parseInt(bestScore)) {
        localStorage.setItem(`snake_best_${userData.uid}`, score.toString());
        setHighScore(score);
      }
    }
  }, [gameState, score, userData]);

  // Load high score on mount
  useEffect(() => {
    if (userData?.uid) {
      const savedHighScore = localStorage.getItem(`snake_best_${userData.uid}`);
      setHighScore(parseInt(savedHighScore) || 0);
    }
  }, [userData]);

  const resetGame = () => {
    setGameState('menu');
  };

  // Render menu
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              🐍 Snake Game
            </motion.h1>
            <p className="text-xl text-gray-300">Classic snake with modern power-ups!</p>
          </div>

          {/* Game Stats */}
          {userData && (
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 mb-8">
              <Typography variant="h6" className="mb-4 text-center">📊 Statistik Kamu</Typography>
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <div className="text-center">
                    <Typography variant="h4" className="text-green-400">{userData.gameStats?.snake?.gamesPlayed || 0}</Typography>
                    <Typography variant="body2" className="text-gray-400">Games Played</Typography>
                  </div>
                </Grid>
                <Grid item xs={4}>
                  <div className="text-center">
                    <Typography variant="h4" className="text-emerald-400">{highScore}</Typography>
                    <Typography variant="body2" className="text-gray-400">High Score</Typography>
                  </div>
                </Grid>
                <Grid item xs={4}>
                  <div className="text-center">
                    <Typography variant="h4" className="text-teal-400">{userData.gameStats?.snake?.highestLevel || 0}</Typography>
                    <Typography variant="body2" className="text-gray-400">Highest Level</Typography>
                  </div>
                </Grid>
              </Grid>
            </div>
          )}

          {/* Power-ups Preview */}
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <Typography variant="h6" className="text-white text-center mb-4">⚡ Power-ups</Typography>
            <Grid container spacing={2}>
              {[
                { emoji: '⚡', name: 'Speed Boost', desc: 'Faster movement' },
                { emoji: '👻', name: 'Ghost Mode', desc: 'Pass through walls' },
                { emoji: '🧲', name: 'Magnet', desc: 'Attract food' }
              ].map((powerUp) => (
                <Grid item xs={4} key={powerUp.name}>
                  <Paper className="bg-black/50 p-3 text-center">
                    <div className="text-2xl mb-1">{powerUp.emoji}</div>
                    <Typography variant="body2" className="text-white font-semibold">
                      {powerUp.name}
                    </Typography>
                    <Typography variant="caption" className="text-gray-400">
                      {powerUp.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </div>

          {/* Controls */}
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <Typography variant="h6" className="text-white text-center mb-4">🎮 Kontrol</Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <div className="text-center">
                  <Typography variant="body1" className="text-white mb-2">Desktop</Typography>
                  <Typography variant="body2" className="text-gray-400">
                    ← → ↑ ↓ / WASD : Move<br/>
                    Space : Pause
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className="text-center">
                  <Typography variant="body1" className="text-white mb-2">Mobile</Typography>
                  <Typography variant="body2" className="text-gray-400">
                    Swipe : Move<br/>
                    Double Tap : Pause
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <Button
              variant="contained"
              size="large"
              onClick={initializeGame}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
            >
              🐍 Start Game
            </Button>
          </div>

          {/* Back Button */}
          <div className="text-center mt-4">
            <Button
              variant="outlined"
              onClick={() => navigate('/game')}
              className="text-white border-white hover:bg-white hover:text-green-900"
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
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Game UI */}
        <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outlined"
              onClick={resetGame}
              className="text-white border-white hover:bg-white hover:text-green-900"
              startIcon={<RefreshIcon />}
            >
              Menu
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <Typography variant="h6" className="text-green-400">
                  Score: {score}
                </Typography>
              </div>
              <div className="text-center">
                <Typography variant="h6" className="text-emerald-400">
                  Level: {level}
                </Typography>
              </div>
              {speedBoost && (
                <Chip label="⚡ Speed" color="primary" />
              )}
              {ghostMode && (
                <Chip label="👻 Ghost" color="secondary" />
              )}
              {magnetMode && (
                <Chip label="🧲 Magnet" color="success" />
              )}
            </div>
            
            <Chip 
              label={`FPS: ${fps}`} 
              color={fps >= 50 ? "success" : fps >= 30 ? "warning" : "error"}
            />
          </div>
        </div>

        {/* Game Area */}
        <div 
          ref={gameAreaRef}
          className="relative bg-gradient-to-b from-green-800 to-emerald-900 rounded-2xl overflow-hidden border-4 border-green-600"
          style={{ 
            height: GAME_HEIGHT,
            width: GAME_WIDTH,
            margin: '0 auto'
          }}
        >
          {/* Grid */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: GRID_SIZE }).map((_, i) => (
              <div key={`h-${i}`} className="absolute w-full h-px bg-green-600" style={{ top: i * CELL_SIZE }} />
            ))}
            {Array.from({ length: GRID_SIZE }).map((_, i) => (
              <div key={`v-${i}`} className="absolute h-full w-px bg-green-600" style={{ left: i * CELL_SIZE }} />
            ))}
          </div>

          {/* Obstacles */}
          {obstacles.map((obstacle, index) => (
            <div
              key={index}
              className="absolute bg-gray-600 rounded-sm flex items-center justify-center text-lg"
              style={{
                left: obstacle.x * CELL_SIZE,
                top: obstacle.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE
              }}
            >
              🪨
            </div>
          ))}

          {/* Snake */}
          {snake.map((segment, index) => (
            <motion.div
              key={index}
              className={`absolute rounded-sm ${index === 0 ? 'bg-green-400' : 'bg-green-600'} ${ghostMode ? 'opacity-50' : ''}`}
              style={{
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE
              }}
              animate={{
                scale: index === 0 ? [1, 1.1, 1] : 1
              }}
              transition={{ duration: 0.2 }}
            >
              {index === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-lg">
                  🐍
                </div>
              )}
            </motion.div>
          ))}

          {/* Food */}
          <motion.div
            className={`absolute rounded-full ${food.color} flex items-center justify-center text-lg animate-pulse`}
            style={{
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE
            }}
          >
            {food.emoji}
          </motion.div>

          {/* Special Food */}
          {specialFood && (
            <motion.div
              className={`absolute rounded-full ${specialFood.color} flex items-center justify-center text-lg animate-bounce`}
              style={{
                left: specialFood.x * CELL_SIZE,
                top: specialFood.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE
              }}
            >
              {specialFood.emoji}
            </motion.div>
          )}

          {/* Pause Overlay */}
          <AnimatePresence>
            {gameState === 'paused' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">⏸️</div>
                  <Typography variant="h4" className="text-white font-bold mb-2">
                    Game Paused
                  </Typography>
                  <Typography variant="h6" className="text-gray-300 mb-4">
                    Press Space or tap to continue
                  </Typography>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Over Overlay */}
          <AnimatePresence>
            {gameState === 'failed' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center"
              >
                <div className="text-center bg-black/50 rounded-2xl p-8">
                  <div className="text-6xl mb-4">💥</div>
                  <Typography variant="h4" className="text-white font-bold mb-2">
                    Game Over!
                  </Typography>
                  <Typography variant="h6" className="text-gray-300 mb-4">
                    Score: {score} | Level: {level}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={initializeGame}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    startIcon={<RefreshIcon />}
                  >
                    Play Again
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-black/30 backdrop-blur-lg rounded-2xl p-4">
          <Typography variant="h6" className="text-white text-center mb-2">
            🎮 Cara Bermain
          </Typography>
          <Typography variant="body2" className="text-gray-300 text-center">
            {isMobile 
              ? 'Swipe untuk bergerak, kumpulkan makanan dan power-ups' 
              : 'Gunakan arrow keys atau WASD untuk bergerak'}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
