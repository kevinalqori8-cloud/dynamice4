import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Typography, Box, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Chip, CircularProgress, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../../hooks/useFirebaseData';
import { userService } from '../../service/firebaseService';
import { useGameOptimization } from '../../hooks/useGameOptimization';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// 🦕 Enhanced Dino Runner - Optimized and Bug Fixed
const DinoRunner = () => {
  const navigate = useNavigate();
  const { userData } = useUserData();
  const gameAreaRef = useRef(null);
  
  // Game optimization hook
  const { fps, isMobile, batterySaving, trackGameEvent } = useGameOptimization('dinorunner');
  
  // Game states
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, completed, failed
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Game variables
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [distance, setDistance] = useState(0);
  
  // Dino states
  const [dinoY, setDinoY] = useState(300);
  const [dinoVelocityY, setDinoVelocityY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isDucking, setIsDucking] = useState(false);
  
  // Game objects
  const [obstacles, setObstacles] = useState([]);
  const [clouds, setClouds] = useState([]);
  const [stars, setStars] = useState([]);
  const [particles, setParticles] = useState([]);
  
  // Game settings
  const GAME_HEIGHT = 400;
  const GROUND_Y = 350;
  const DINO_X = 100;
  const GRAVITY = 0.8;
  const JUMP_FORCE = -15;
  
  // Obstacle types
  const obstacleTypes = [
    { width: 30, height: 50, color: 'bg-red-500', type: 'cactus_small', points: 10 },
    { width: 40, height: 70, color: 'bg-red-600', type: 'cactus_large', points: 15 },
    { width: 60, height: 30, color: 'bg-gray-600', type: 'bird', points: 20, flying: true }
  ];

  // Initialize game
  const initializeGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setDistance(0);
    setGameSpeed(1);
    setDinoY(GROUND_Y - 50);
    setDinoVelocityY(0);
    setIsJumping(false);
    setIsDucking(false);
    setObstacles([]);
    setParticles([]);
    
    // Track game start
    trackGameEvent('game_start', { game: 'dinorunner' });
    
    // Load high score
    if (userData?.uid) {
      const savedHighScore = localStorage.getItem(`dino_highscore_${userData.uid}`);
      setHighScore(parseInt(savedHighScore) || 0);
    }
  }, [userData, trackGameEvent]);

  // Handle jump
  const jump = useCallback(() => {
    if (!isJumping && dinoY >= GROUND_Y - 60) {
      setDinoVelocityY(JUMP_FORCE);
      setIsJumping(true);
      trackGameEvent('jump', { game: 'dinorunner' });
    }
  }, [isJumping, dinoY, trackGameEvent]);

  // Handle duck
  const duck = useCallback((isDucking) => {
    setIsDucking(isDucking);
    if (isDucking) {
      trackGameEvent('duck', { game: 'dinorunner' });
    }
  }, [trackGameEvent]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      
      switch(e.code) {
        case 'Space':
        case 'ArrowUp':
          e.preventDefault();
          jump();
          break;
        case 'ArrowDown':
          e.preventDefault();
          duck(true);
          break;
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'ArrowDown') {
        duck(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, jump, duck]);

  // Touch controls for mobile
  useEffect(() => {
    if (!isMobile) return;
    
    const handleTouchStart = (e) => {
      if (gameState !== 'playing') return;
      
      const touch = e.touches[0];
      const gameArea = gameAreaRef.current;
      if (!gameArea) return;
      
      const rect = gameArea.getBoundingClientRect();
      const touchY = touch.clientY - rect.top;
      
      if (touchY < GAME_HEIGHT / 2) {
        jump();
      } else {
        duck(true);
      }
    };

    const handleTouchEnd = () => {
      duck(false);
    };

    const gameArea = gameAreaRef.current;
    if (gameArea) {
      gameArea.addEventListener('touchstart', handleTouchStart);
      gameArea.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      if (gameArea) {
        gameArea.removeEventListener('touchstart', handleTouchStart);
        gameArea.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [gameState, isMobile, jump, duck]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      // Update dino physics
      setDinoY(prevY => {
        const newY = prevY + dinoVelocityY;
        setDinoVelocityY(prevVel => {
          const newVel = prevVel + GRAVITY;
          if (newY >= GROUND_Y - (isDucking ? 30 : 50)) {
            setIsJumping(false);
            return 0;
          }
          return newVel;
        });
        return Math.min(newY, GROUND_Y - (isDucking ? 30 : 50));
      });

      // Update distance and score
      setDistance(prev => prev + gameSpeed);
      setScore(prev => Math.floor(distance / 10));

      // Increase game speed
      setGameSpeed(prev => Math.min(prev + 0.001, 3));

      // Spawn obstacles
      setObstacles(prev => {
        let newObstacles = prev.filter(obs => obs.x > -100);
        
        if (Math.random() < 0.02 * gameSpeed) {
          const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          newObstacles.push({
            id: Date.now() + Math.random(),
            x: 800,
            y: type.flying ? GROUND_Y - 100 - Math.random() * 100 : GROUND_Y - type.height,
            ...type,
            passed: false
          });
        }
        
        return newObstacles.map(obs => ({
          ...obs,
          x: obs.x - 5 * gameSpeed
        }));
      });

      // Spawn clouds and stars
      setClouds(prev => {
        let newClouds = prev.filter(cloud => cloud.x > -100);
        if (Math.random() < 0.01) {
          newClouds.push({
            id: Date.now(),
            x: 800,
            y: 50 + Math.random() * 100,
            speed: 0.5 + Math.random() * 0.5,
            size: 20 + Math.random() * 30
          });
        }
        return newClouds.map(cloud => ({ ...cloud, x: cloud.x - cloud.speed }));
      });

      setStars(prev => {
        let newStars = prev.filter(star => star.x > -10);
        if (Math.random() < 0.005) {
          newStars.push({
            id: Date.now(),
            x: 800,
            y: Math.random() * 200,
            speed: 1 + Math.random() * 2
          });
        }
        return newStars.map(star => ({ ...star, x: star.x - star.speed }));
      });

      // Create particles
      setParticles(prev => {
        let newParticles = prev.filter(p => p.life > 0);
        if (Math.random() < 0.1) {
          newParticles.push({
            id: Date.now(),
            x: DINO_X + 20,
            y: dinoY + 25,
            vx: -2 - Math.random() * 2,
            vy: -1 - Math.random() * 2,
            life: 30
          });
        }
        return newParticles.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 1
        }));
      });

      // Check collisions
      setObstacles(prev => {
        return prev.map(obs => {
          if (obs.passed) return obs;
          
          const dinoHeight = isDucking ? 30 : 50;
          const collision = 
            DINO_X < obs.x + obs.width &&
            DINO_X + 40 > obs.x &&
            dinoY < obs.y + obs.height &&
            dinoY + dinoHeight > obs.y;
          
          if (collision) {
            setGameState('failed');
            trackGameEvent('game_over', { game: 'dinorunner', score });
            return { ...obs, passed: true };
          }
          
          if (obs.x < DINO_X && !obs.passed) {
            setScore(prev => prev + obs.points);
            return { ...obs, passed: true };
          }
          
          return obs;
        });
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameState, dinoY, dinoVelocityY, isDucking, gameSpeed, distance, score, trackGameEvent]);

  // Save high score
  useEffect(() => {
    if (gameState === 'failed' && score > highScore && userData?.uid) {
      setHighScore(score);
      localStorage.setItem(`dino_highscore_${userData.uid}`, score.toString());
      
      // Save to leaderboard
      userService.addScore(userData.uid, 'dinorunner', score);
    }
  }, [gameState, score, highScore, userData]);

  const resetGame = () => {
    setGameState('menu');
    setShowNameInput(false);
    setPlayerName("");
  };

  const startGame = () => {
    if (playerName.trim()) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        initializeGame();
      }, 1000);
    } else {
      setShowNameInput(true);
    }
  };

  // Render menu
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              🦕 Dino Runner
            </motion.h1>
            <p className="text-xl text-gray-300">Lari dari kejaran waktu dan rintangan!</p>
          </div>

          {/* Game Stats */}
          {userData && (
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 mb-8">
              <Typography variant="h6" className="mb-4 text-center">📊 Statistik Kamu</Typography>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Typography variant="h4" className="text-purple-400">{userData.gameStats?.dinorunner?.gamesPlayed || 0}</Typography>
                  <Typography variant="body2" className="text-gray-400">Games Played</Typography>
                </div>
                <div className="text-center">
                  <Typography variant="h4" className="text-blue-400">{highScore}</Typography>
                  <Typography variant="body2" className="text-gray-400">High Score</Typography>
                </div>
                <div className="text-center">
                  <Typography variant="h4" className="text-green-400">{userData.gameStats?.dinorunner?.bestDistance || 0}m</Typography>
                  <Typography variant="body2" className="text-gray-400">Best Distance</Typography>
                </div>
              </div>
            </div>
          )}

          {/* Controls Info */}
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <Typography variant="h6" className="text-white text-center mb-4">🎮 Kontrol</Typography>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center">
                <ArrowUpwardIcon className="text-4xl text-blue-400 mb-2" />
                <Typography variant="body1" className="text-white">Lompat</Typography>
                <Typography variant="body2" className="text-gray-400">Space / Up Arrow / Tap atas</Typography>
              </div>
              <div className="text-center">
                <ArrowDownwardIcon className="text-4xl text-green-400 mb-2" />
                <Typography variant="body1" className="text-white">Merunduk</Typography>
                <Typography variant="body2" className="text-gray-400">Down Arrow / Tap bawah</Typography>
              </div>
            </div>
          </div>

          {/* Name Input */}
          {showNameInput && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 mb-8"
            >
              <Typography variant="h6" className="text-white text-center mb-4">
                Siapa nama kamu?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Masukkan nama kamu..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="mb-4"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#8a2be2',
                    },
                  },
                }}
              />
            </motion.div>
          )}

          {/* Start Button */}
          <div className="text-center">
            <Button
              variant="contained"
              size="large"
              onClick={startGame}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                '▶️ Mulai Bermain'
              )}
            </Button>
          </div>

          {/* Back Button */}
          <div className="text-center mt-4">
            <Button
              variant="outlined"
              onClick={() => navigate('/game')}
              className="text-white border-white hover:bg-white hover:text-purple-900"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Game UI */}
        <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outlined"
              onClick={resetGame}
              className="text-white border-white hover:bg-white hover:text-purple-900"
              startIcon={<RefreshIcon />}
            >
              Menu
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <Typography variant="h6" className="text-purple-400">
                  Score: {score}
                </Typography>
              </div>
              <div className="text-center">
                <Typography variant="h6" className="text-blue-400">
                  High: {highScore}
                </Typography>
              </div>
              <div className="text-center">
                <Typography variant="h6" className="text-green-400">
                  {Math.floor(distance)}m
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
          ref={gameAreaRef}
          className="relative bg-gradient-to-b from-blue-400 to-green-400 rounded-2xl overflow-hidden"
          style={{ 
            height: GAME_HEIGHT,
            cursor: 'pointer',
            touchAction: 'none'
          }}
        >
          {/* Background elements */}
          {clouds.map(cloud => (
            <div
              key={cloud.id}
              className="absolute text-4xl opacity-70"
              style={{
                left: cloud.x,
                top: cloud.y,
                fontSize: cloud.size
              }}
            >
              ☁️
            </div>
          ))}
          
          {stars.map(star => (
            <div
              key={star.id}
              className="absolute text-yellow-300 animate-pulse"
              style={{
                left: star.x,
                top: star.y,
                fontSize: 12
              }}
            >
              ⭐
            </div>
          ))}

          {/* Ground */}
          <div 
            className="absolute bottom-0 w-full bg-gradient-to-t from-green-600 to-green-500"
            style={{ height: GAME_HEIGHT - GROUND_Y }}
          />

          {/* Dino */}
          <motion.div
            className="absolute flex items-center justify-center"
            style={{
              left: DINO_X,
              top: dinoY,
              width: 40,
              height: isDucking ? 30 : 50
            }}
            animate={{
              scaleY: isDucking ? 0.6 : 1
            }}
            transition={{ duration: 0.1 }}
          >
            <span className="text-4xl">
              {isDucking ? '🦕' : '🦖'}
            </span>
          </motion.div>

          {/* Obstacles */}
          {obstacles.map(obstacle => (
            <div
              key={obstacle.id}
              className={`absolute rounded ${obstacle.color} flex items-center justify-center`}
              style={{
                left: obstacle.x,
                top: obstacle.y,
                width: obstacle.width,
                height: obstacle.height
              }}
            >
              {obstacle.type.includes('cactus') && <span className="text-2xl">🌵</span>}
              {obstacle.type === 'bird' && <span className="text-2xl">🦅</span>}
            </div>
          ))}

          {/* Particles */}
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                left: particle.x,
                top: particle.y,
                opacity: particle.life / 30
              }}
            />
          ))}

          {/* Game Over Overlay */}
          <AnimatePresence>
            {gameState === 'failed' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">💥</div>
                  <Typography variant="h4" className="text-white font-bold mb-2">
                    Game Over!
                  </Typography>
                  <Typography variant="h6" className="text-gray-300 mb-4">
                    Score: {score} | Distance: {Math.floor(distance)}m
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={initializeGame}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
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
              onTouchStart={jump}
              className="bg-black/30 text-white border-white/50 py-4"
              startIcon={<ArrowUpwardIcon />}
            >
              Lompat
            </Button>
            <Button
              variant="outlined"
              onTouchStart={() => duck(true)}
              onTouchEnd={() => duck(false)}
              className="bg-black/30 text-white border-white/50 py-4"
              startIcon={<ArrowDownwardIcon />}
            >
              Merunduk
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-black/30 backdrop-blur-lg rounded-2xl p-4">
          <Typography variant="h6" className="text-white text-center mb-2">
            🎮 Cara Bermain
          </Typography>
          <Typography variant="body2" className="text-gray-300 text-center">
            {isMobile 
              ? 'Gunakan tombol di atas untuk lompat dan merunduk' 
              : 'Tekan Space/Up untuk lompat, Down untuk merunduk'}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default DinoRunner;
