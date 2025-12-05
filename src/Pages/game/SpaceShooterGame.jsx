import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Typography, Box, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../../hooks/useFirebaseData';
import { userService } from '../../service/firebaseService';
import { useGameOptimization } from '../../hooks/useGameOptimization';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RocketIcon from '@mui/icons-material/Rocket';

// 🚀 Space Shooter - Defend Earth from Alien Invasion!
const SpaceShooterGame = () => {
  const navigate = useNavigate();
  const { userData } = useUserData();
  const gameAreaRef = useRef(null);
  
  // Game optimization hook
  const { fps, isMobile, batterySaving, trackGameEvent } = useGameOptimization('spaceshooter');
  
  // Game states
  const [gameState, setGameState] = useState('menu'); // menu, playing, completed, failed
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  
  // Player spaceship
  const [player, setPlayer] = useState({ x: 400, y: 500, width: 50, height: 50 });
  const [bullets, setBullets] = useState([]);
  
  // Enemies
  const [enemies, setEnemies] = useState([]);
  const [enemyBullets, setEnemyBullets] = useState([]);
  
  // Power-ups
  const [powerUps, setPowerUps] = useState([]);
  const [particles, setParticles] = useState([]);
  
  // Player abilities
  const [weaponLevel, setWeaponLevel] = useState(1);
  const [shield, setShield] = useState(0);
  const [rapidFire, setRapidFire] = useState(false);
  
  // Game settings
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  
  // Enemy types
  const enemyTypes = [
    { 
      name: 'Alien Fighter', 
      emoji: '👽', 
      health: 1, 
      speed: 2, 
      points: 10,
      shootChance: 0.002,
      bulletSpeed: 3,
      color: 'bg-green-500'
    },
    { 
      name: 'Alien Cruiser', 
      emoji: '🛸', 
      health: 3, 
      speed: 1, 
      points: 25,
      shootChance: 0.005,
      bulletSpeed: 2,
      color: 'bg-purple-500'
    },
    { 
      name: 'Alien Boss', 
      emoji: '👾', 
      health: 10, 
      speed: 0.5, 
      points: 100,
      shootChance: 0.01,
      bulletSpeed: 4,
      color: 'bg-red-500'
    }
  ];

  // Power-up types
  const powerUpTypes = [
    { name: 'Weapon Upgrade', emoji: '⚡', effect: 'weapon', color: 'bg-yellow-500' },
    { name: 'Shield', emoji: '🛡️', effect: 'shield', color: 'bg-blue-500' },
    { name: 'Rapid Fire', emoji: '🔥', effect: 'rapid', color: 'bg-orange-500' },
    { name: 'Extra Life', emoji: '❤️', effect: 'life', color: 'bg-red-500' }
  ];

  // Initialize game
  const initializeGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setTime(0);
    setPlayer({ x: 400, y: 500, width: 50, height: 50 });
    setBullets([]);
    setEnemies([]);
    setEnemyBullets([]);
    setPowerUps([]);
    setParticles([]);
    setWeaponLevel(1);
    setShield(0);
    setRapidFire(false);
    
    trackGameEvent('game_start', { game: 'spaceshooter' });
  }, [trackGameEvent]);

  // Player movement
  const movePlayer = useCallback((direction) => {
    setPlayer(prev => {
      let newX = prev.x;
      const speed = 10;
      
      switch(direction) {
        case 'left':
          newX = Math.max(25, prev.x - speed);
          break;
        case 'right':
          newX = Math.min(GAME_WIDTH - 25, prev.x + speed);
          break;
      }
      
      return { ...prev, x: newX };
    });
  }, []);

  // Shooting
  const shoot = useCallback(() => {
    if (gameState !== 'playing') return;
    
    setBullets(prev => {
      const newBullets = [];
      
      if (weaponLevel >= 1) {
        newBullets.push({
          id: Date.now() + Math.random(),
          x: player.x,
          y: player.y - 25,
          speed: 8,
          damage: 1
        });
      }
      
      if (weaponLevel >= 2) {
        newBullets.push({
          id: Date.now() + Math.random() + 1,
          x: player.x - 15,
          y: player.y - 15,
          speed: 8,
          damage: 1
        });
        newBullets.push({
          id: Date.now() + Math.random() + 2,
          x: player.x + 15,
          y: player.y - 15,
          speed: 8,
          damage: 1
        });
      }
      
      if (weaponLevel >= 3) {
        newBullets.push({
          id: Date.now() + Math.random() + 3,
          x: player.x - 30,
          y: player.y - 5,
          speed: 8,
          damage: 1
        });
        newBullets.push({
          id: Date.now() + Math.random() + 4,
          x: player.x + 30,
          y: player.y - 5,
          speed: 8,
          damage: 1
        });
      }
      
      return [...prev, ...newBullets];
    });
    
    trackGameEvent('shoot', { game: 'spaceshooter', weaponLevel });
  }, [player, weaponLevel, gameState, trackGameEvent]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      
      switch(e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault();
          movePlayer('left');
          break;
        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault();
          movePlayer('right');
          break;
        case 'Space':
          e.preventDefault();
          shoot();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, movePlayer, shoot]);

  // Auto-shoot for rapid fire
  useEffect(() => {
    if (!rapidFire || gameState !== 'playing') return;
    
    const shootInterval = setInterval(() => {
      shoot();
    }, 100);
    
    return () => clearInterval(shootInterval);
  }, [rapidFire, shoot, gameState]);

  // Touch controls
  useEffect(() => {
    if (!isMobile) return;
    
    const handleTouchMove = (e) => {
      if (gameState !== 'playing') return;
      
      const touch = e.touches[0];
      const gameArea = gameAreaRef.current;
      if (!gameArea) return;
      
      const rect = gameArea.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      
      setPlayer(prev => ({ ...prev, x: Math.max(25, Math.min(GAME_WIDTH - 25, x)) }));
    };
    
    const handleTouchStart = (e) => {
      if (gameState !== 'playing') return;
      shoot();
    };

    const gameArea = gameAreaRef.current;
    if (gameArea) {
      gameArea.addEventListener('touchmove', handleTouchMove);
      gameArea.addEventListener('touchstart', handleTouchStart);
    }
    
    return () => {
      if (gameArea) {
        gameArea.removeEventListener('touchmove', handleTouchMove);
        gameArea.removeEventListener('touchstart', handleTouchStart);
      }
    };
  }, [gameState, isMobile, shoot]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      setTime(prev => prev + 1);
      
      // Update bullets
      setBullets(prev => prev
        .map(bullet => ({ ...bullet, y: bullet.y - bullet.speed }))
        .filter(bullet => bullet.y > -10)
      );
      
      // Update enemy bullets
      setEnemyBullets(prev => prev
        .map(bullet => ({ ...bullet, y: bullet.y + bullet.speed }))
        .filter(bullet => bullet.y < GAME_HEIGHT + 10)
      );
      
      // Spawn enemies
      setEnemies(prev => {
        let newEnemies = prev.filter(enemy => enemy.y < GAME_HEIGHT + 50 && enemy.health > 0);
        
        if (Math.random() < 0.02 + level * 0.005) {
          const enemyType = enemyTypes[Math.floor(Math.random() * Math.min(enemyTypes.length, Math.ceil(level / 2)))];
          newEnemies.push({
            id: Date.now() + Math.random(),
            ...enemyType,
            x: Math.random() * (GAME_WIDTH - 50) + 25,
            y: -50,
            maxHealth: enemyType.health
          });
        }
        
        return newEnemies.map(enemy => ({
          ...enemy,
          y: enemy.y + enemy.speed,
          // Enemy shooting
          ...(Math.random() < enemy.shootChance && {
            lastShot: Date.now()
          })
        }));
      });
      
      // Enemy shooting
      setEnemies(prev => {
        const shootingEnemies = prev.filter(enemy => enemy.lastShot && Date.now() - enemy.lastShot < 100);
        
        shootingEnemies.forEach(enemy => {
          setEnemyBullets(prevBullets => [...prevBullets, {
            id: Date.now() + Math.random(),
            x: enemy.x,
            y: enemy.y + 25,
            speed: enemy.bulletSpeed
          }]);
        });
        
        return prev.map(enemy => ({ ...enemy, lastShot: undefined }));
      });
      
      // Spawn power-ups
      setPowerUps(prev => {
        let newPowerUps = prev.filter(powerUp => !powerUp.collected);
        
        if (Math.random() < 0.002) {
          const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
          newPowerUps.push({
            id: Date.now() + Math.random(),
            ...powerUpType,
            x: Math.random() * (GAME_WIDTH - 30) + 15,
            y: -30,
            collected: false
          });
        }
        
        return newPowerUps.map(powerUp => ({ ...powerUp, y: powerUp.y + 2 }));
      });
      
      // Update particles
      setParticles(prev => prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 1
        }))
        .filter(particle => particle.life > 0)
      );
      
      // Check collisions
      checkCollisions();
      
      // Level progression
      if (score > level * 500) {
        setLevel(prev => prev + 1);
        trackGameEvent('level_up', { game: 'spaceshooter', level: level + 1 });
      }
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameState, level, checkCollisions, trackGameEvent]);

  // Collision detection
  const checkCollisions = useCallback(() => {
    // Bullet vs Enemy collisions
    setBullets(prevBullets => {
      const remainingBullets = [];
      
      prevBullets.forEach(bullet => {
        let bulletHit = false;
        
        setEnemies(prevEnemies => prevEnemies.map(enemy => {
          if (bulletHit) return enemy;
          
          const distance = Math.sqrt(
            Math.pow(bullet.x - enemy.x, 2) + 
            Math.pow(bullet.y - enemy.y, 2)
          );
          
          if (distance < 25) {
            bulletHit = true;
            const newHealth = enemy.health - bullet.damage;
            
            if (newHealth <= 0) {
              setScore(prev => prev + enemy.points);
              
              // Create explosion particles
              for (let i = 0; i < 10; i++) {
                setParticles(prev => [...prev, {
                  id: Date.now() + Math.random(),
                  x: enemy.x,
                  y: enemy.y,
                  vx: (Math.random() - 0.5) * 10,
                  vy: (Math.random() - 0.5) * 10,
                  life: 30,
                  color: enemy.color
                }]);
              }
              
              // Chance to drop power-up
              if (Math.random() < 0.1) {
                const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                setPowerUps(prev => [...prev, {
                  id: Date.now() + Math.random(),
                  ...powerUpType,
                  x: enemy.x,
                  y: enemy.y,
                  collected: false
                }]);
              }
              
              return null;
            }
            
            return { ...enemy, health: newHealth };
          }
          
          return enemy;
        }).filter(Boolean));
        
        if (!bulletHit) {
          remainingBullets.push(bullet);
        }
      });
      
      return remainingBullets;
    });
    
    // Player vs Enemy Bullet collisions
    setEnemyBullets(prevBullets => {
      return prevBullets.filter(bullet => {
        const distance = Math.sqrt(
          Math.pow(bullet.x - player.x, 2) + 
          Math.pow(bullet.y - player.y, 2)
        );
        
        if (distance < 25) {
          if (shield > 0) {
            setShield(prev => prev - 1);
          } else {
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                setGameState('failed');
                trackGameEvent('game_over', { game: 'spaceshooter', score, level });
              }
              return newLives;
            });
          }
          return false;
        }
        
        return true;
      });
    });
    
    // Player vs Power-up collisions
    setPowerUps(prevPowerUps => {
      return prevPowerUps.map(powerUp => {
        if (powerUp.collected) return powerUp;
        
        const distance = Math.sqrt(
          Math.pow(powerUp.x - player.x, 2) + 
          Math.pow(powerUp.y - player.y, 2)
        );
        
        if (distance < 30) {
          applyPowerUp(powerUp.effect);
          return { ...powerUp, collected: true };
        }
        
        return powerUp;
      });
    });
  }, [player, shield, score, level, trackGameEvent]);

  // Apply power-up effects
  const applyPowerUp = (effect) => {
    switch(effect) {
      case 'weapon':
        setWeaponLevel(prev => Math.min(prev + 1, 3));
        break;
      case 'shield':
        setShield(prev => prev + 1);
        break;
      case 'rapid':
        setRapidFire(true);
        setTimeout(() => setRapidFire(false), 5000);
        break;
      case 'life':
        setLives(prev => prev + 1);
        break;
    }
    
    trackGameEvent('power_up_collected', { game: 'spaceshooter', effect });
  };

  // Save high score
  useEffect(() => {
    if (gameState === 'completed' && userData?.uid) {
      userService.addScore(userData.uid, 'spaceshooter', score);
      
      const bestScore = localStorage.getItem(`spaceshooter_best_${userData.uid}`);
      if (!bestScore || score > parseInt(bestScore)) {
        localStorage.setItem(`spaceshooter_best_${userData.uid}`, score.toString());
      }
    }
  }, [gameState, score, userData]);

  const resetGame = () => {
    setGameState('menu');
  };

  // Render menu
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              🚀 Space Shooter
            </motion.h1>
            <p className="text-xl text-gray-300">Defend Earth from alien invasion!</p>
          </div>

          {/* Game Stats */}
          {userData && (
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 mb-8">
              <Typography variant="h6" className="mb-4 text-center">📊 Statistik Kamu</Typography>
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <div className="text-center">
                    <Typography variant="h4" className="text-indigo-400">{userData.gameStats?.spaceshooter?.gamesPlayed || 0}</Typography>
                    <Typography variant="body2" className="text-gray-400">Games Played</Typography>
                  </div>
                </Grid>
                <Grid item xs={4}>
                  <div className="text-center">
                    <Typography variant="h4" className="text-pink-400">
                      {localStorage.getItem(`spaceshooter_best_${userData.uid}`) || 0}
                    </Typography>
                    <Typography variant="body2" className="text-gray-400">Best Score</Typography>
                  </div>
                </Grid>
                <Grid item xs={4}>
                  <div className="text-center">
                    <Typography variant="h4" className="text-purple-400">{userData.gameStats?.spaceshooter?.highestLevel || 0}</Typography>
                    <Typography variant="body2" className="text-gray-400">Highest Level</Typography>
                  </div>
                </Grid>
              </Grid>
            </div>
          )}

          {/* Controls */}
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <Typography variant="h6" className="text-white text-center mb-4">🎮 Kontrol</Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <div className="text-center">
                  <Typography variant="body1" className="text-white mb-2">Desktop</Typography>
                  <Typography variant="body2" className="text-gray-400">
                    ← → / A D : Move<br/>
                    Space : Shoot
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className="text-center">
                  <Typography variant="body1" className="text-white mb-2">Mobile</Typography>
                  <Typography variant="body2" className="text-gray-400">
                    Touch & Drag : Move<br/>
                    Tap : Shoot
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
              className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
              startIcon={<RocketIcon />}
            >
              🚀 Start Mission
            </Button>
          </div>

          {/* Back Button */}
          <div className="text-center mt-4">
            <Button
              variant="outlined"
              onClick={() => navigate('/game')}
              className="text-white border-white hover:bg-white hover:text-indigo-900"
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Game UI */}
        <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outlined"
              onClick={resetGame}
              className="text-white border-white hover:bg-white hover:text-indigo-900"
              startIcon={<RefreshIcon />}
            >
              Menu
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <Typography variant="h6" className="text-indigo-400">
                  Score: {score}
                </Typography>
              </div>
              <div className="text-center">
                <Typography variant="h6" className="text-pink-400">
                  Level: {level}
                </Typography>
              </div>
              <div className="text-center">
                <Typography variant="h6" className="text-red-400">
                  ❤️ {lives}
                </Typography>
              </div>
              {shield > 0 && (
                <div className="text-center">
                  <Typography variant="h6" className="text-blue-400">
                    🛡️ {shield}
                  </Typography>
                </div>
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
          className="relative bg-gradient-to-b from-black to-indigo-900 rounded-2xl overflow-hidden"
          style={{ 
            height: GAME_HEIGHT,
            width: GAME_WIDTH,
            margin: '0 auto',
            cursor: 'crosshair'
          }}
        >
          {/* Stars background */}
          <div className="absolute inset-0">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              />
            ))}
          </div>

          {/* Player spaceship */}
          <motion.div
            className="absolute flex items-center justify-center text-4xl"
            style={{
              left: player.x - 25,
              top: player.y - 25,
              width: player.width,
              height: player.height
            }}
            animate={{
              scale: rapidFire ? [1, 1.2, 1] : 1
            }}
            transition={{ duration: 0.1 }}
          >
            🚀
            {shield > 0 && (
              <div className="absolute inset-0 border-4 border-blue-400 rounded-full animate-pulse" />
            )}
          </motion.div>

          {/* Player bullets */}
          {bullets.map(bullet => (
            <div
              key={bullet.id}
              className="absolute w-2 h-4 bg-yellow-400 rounded-full"
              style={{
                left: bullet.x - 1,
                top: bullet.y - 2
              }}
            />
          ))}

          {/* Enemies */}
          {enemies.map(enemy => (
            <motion.div
              key={enemy.id}
              className={`absolute rounded-full ${enemy.color} flex items-center justify-center text-2xl`}
              style={{
                left: enemy.x - 25,
                top: enemy.y - 25,
                width: 50,
                height: 50
              }}
              animate={{
                scale: enemy.health < enemy.maxHealth ? [1, 0.9, 1] : 1
              }}
              transition={{ duration: 0.2 }}
            >
              {enemy.emoji}
              {/* Health bar */}
              {enemy.health < enemy.maxHealth && (
                <div className="absolute -top-2 left-0 w-full h-1 bg-gray-700 rounded">
                  <div 
                    className="h-full bg-red-500 rounded"
                    style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                  />
                </div>
              )}
            </motion.div>
          ))}

          {/* Enemy bullets */}
          {enemyBullets.map(bullet => (
            <div
              key={bullet.id}
              className="absolute w-3 h-3 bg-red-400 rounded-full"
              style={{
                left: bullet.x - 1.5,
                top: bullet.y - 1.5
              }}
            />
          ))}

          {/* Power-ups */}
          {powerUps.map(powerUp => (
            <motion.div
              key={powerUp.id}
              className={`absolute rounded-full ${powerUp.color} flex items-center justify-center text-xl animate-pulse`}
              style={{
                left: powerUp.x - 15,
                top: powerUp.y - 15,
                width: 30,
                height: 30
              }}
            >
              {powerUp.emoji}
            </motion.div>
          ))}

          {/* Particles */}
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: particle.x - 1,
                top: particle.y - 1,
                backgroundColor: particle.color,
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
                <div className="text-center bg-black/50 rounded-2xl p-8">
                  <div className="text-6xl mb-4">💥</div>
                  <Typography variant="h4" className="text-white font-bold mb-2">
                    Mission Failed!
                  </Typography>
                  <Typography variant="h6" className="text-gray-300 mb-4">
                    Score: {score} | Level: {level}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={initializeGame}
                    className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white"
                    startIcon={<RefreshIcon />}
                  >
                    Try Again
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Controls */}
        {isMobile && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            <Button
              variant="outlined"
              onClick={() => shoot()}
              className="bg-black/30 text-white border-white/50 py-4"
            >
              🔫 Shoot
            </Button>
            <div className="text-center text-white">
              <Typography variant="body2">Drag to Move</Typography>
            </div>
            <Button
              variant="outlined"
              onClick={shoot}
              className="bg-black/30 text-white border-white/50 py-4"
            >
              🔫 Shoot
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
              ? 'Drag untuk bergerak, tap untuk menembak' 
              : '← → untuk bergerak, Space untuk menembak'}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default SpaceShooterGame;
