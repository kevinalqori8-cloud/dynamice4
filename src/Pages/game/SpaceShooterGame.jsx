// src/Pages/game/SpaceShooterGame.jsx - FIXED

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSafeGame } from '../../hooks/useSafeGame';

const SpaceShooterGame = () => {
  const navigate = useNavigate();
  const { safeLocalStorage } = useSafeGame();
  
  // FIX: Define all variables before use
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const PLAYER_SIZE = 40;
  const BULLET_SIZE = 8;
  const ENEMY_SIZE = 35;
  const POWERUP_SIZE = 25;
  
  // Game state
  const [gameState, setGameState] = useState('ready'); // ready, playing, paused, failed
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [player, setPlayer] = useState({ 
    x: GAME_WIDTH / 2, 
    y: GAME_HEIGHT - 100, 
    size: PLAYER_SIZE 
  });
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [particles, setParticles] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const gameAreaRef = useRef(null);
  const animationRef = useRef(null);

  // FIX: Initialize arrays properly
  const [obstacles] = useState([
    { x: 100, y: 300, width: 80, height: 20 },
    { x: 300, y: 400, width: 80, height: 20 },
    { x: 500, y: 250, width: 80, height: 20 },
  ]);

  // Initialize game
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Load player name
    const savedName = safeLocalStorage.getItem('gamehub_player_name', '');
    if (savedName) {
      setPlayerName(savedName);
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoop();
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [gameState]);

  const gameLoop = () => {
    // Move bullets
    setBullets(prev => prev.map(bullet => ({
      ...bullet,
      y: bullet.y - bullet.speed
    })).filter(bullet => bullet.y > -50));

    // Move enemies
    setEnemies(prev => prev.map(enemy => ({
      ...enemy,
      y: enemy.y + enemy.speed,
      x: enemy.x + Math.sin(enemy.y * 0.02) * enemy.amplitude // Wave movement
    })).filter(enemy => enemy.y < GAME_HEIGHT + 50));

    // Move power-ups
    setPowerUps(prev => prev.map(powerUp => ({
      ...powerUp,
      y: powerUp.y + powerUp.speed
    })).filter(powerUp => powerUp.y < GAME_HEIGHT + 50));

    // Check collisions
    checkCollisions();

    // Spawn enemies
    if (Math.random() < 0.02 + (level * 0.01)) {
      spawnEnemy();
    }

    // Spawn power-ups
    if (Math.random() < 0.005) {
      spawnPowerUp();
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  };

  // FIX: Proper collision detection
  const checkCollisions = () => {
    // Bullet vs Enemy
    setBullets(prevBullets => {
      const remainingBullets = [];
      const hitEnemies = [];

      prevBullets.forEach(bullet => {
        let hit = false;
        setEnemies(prevEnemies => {
          return prevEnemies.filter(enemy => {
            const distance = Math.sqrt(
              Math.pow(bullet.x - enemy.x, 2) + Math.pow(bullet.y - enemy.y, 2)
            );
            if (distance < (bullet.size + enemy.size) / 2) {
              hit = true;
              createExplosion(enemy.x, enemy.y);
              setScore(prev => prev + 10);
              return false;
            }
            return true;
          });
        });
        
        if (!hit) remainingBullets.push(bullet);
      });
      
      return remainingBullets;
    });

    // Player vs Enemy
    setEnemies(prevEnemies => {
      return prevEnemies.filter(enemy => {
        const distance = Math.sqrt(
          Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2)
        );
        if (distance < (player.size + enemy.size) / 2) {
          setLives(prev => prev - 1);
          createExplosion(enemy.x, enemy.y);
          if (lives <= 1) {
            setGameState('failed');
          }
          return false;
        }
        return true;
      });
    });

    // Player vs PowerUp
    setPowerUps(prevPowerUps => {
      return prevPowerUps.filter(powerUp => {
        const distance = Math.sqrt(
          Math.pow(player.x - powerUp.x, 2) + Math.pow(player.y - powerUp.y, 2)
        );
        if (distance < (player.size + powerUp.size) / 2) {
          applyPowerUp(powerUp.type);
          return false;
        }
        return true;
      });
    });
  };

  const spawnEnemy = () => {
    const newEnemy = {
      id: Date.now() + Math.random(),
      x: Math.random() * (GAME_WIDTH - 50),
      y: -50,
      size: ENEMY_SIZE,
      speed: 1 + Math.random() * 2,
      amplitude: Math.random() * 50,
      emoji: ['👾', '🛸', '💥'][Math.floor(Math.random() * 3)]
    };
    setEnemies(prev => [...prev, newEnemy]);
  };

  const spawnPowerUp = () => {
    const powerUpTypes = [
      { emoji: '⚡', effect: 'speed', color: 'from-yellow-400 to-orange-400' },
      { emoji: '❤️', effect: 'life', color: 'from-red-400 to-pink-400' },
      { emoji: '🔥', effect: 'rapidFire', color: 'from-orange-400 to-red-400' }
    ];
    
    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    const newPowerUp = {
      id: Date.now() + Math.random(),
      x: Math.random() * (GAME_WIDTH - 30),
      y: -30,
      size: POWERUP_SIZE,
      speed: 2,
      ...type
    };
    setPowerUps(prev => [...prev, newPowerUp]);
  };

  const applyPowerUp = (type) => {
    switch(type) {
      case 'speed':
        // Increase bullet speed temporarily
        break;
      case 'life':
        setLives(prev => Math.min(prev + 1, 5));
        break;
      case 'rapidFire':
        // Implement rapid fire
        break;
    }
  };

  const createExplosion = (x, y) => {
    const particles = [];
    for (let i = 0; i < 8; i++) {
      particles.push({
        id: Date.now() + i,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 30,
        color: `hsl(${Math.random() * 60 + 10}, 100%, 50%)`
      });
    }
    setParticles(prev => [...prev, ...particles]);
  };

  // Handle input
  const handleKeyPress = useCallback((e) => {
    if (gameState !== 'playing') return;

    switch(e.key.toLowerCase()) {
      case ' ':
      case 'spacebar':
        e.preventDefault();
        shoot();
        break;
      case 'arrowleft':
      case 'a':
        setPlayer(prev => ({ ...prev, x: Math.max(0, prev.x - 20) }));
        break;
      case 'arrowright':
      case 'd':
        setPlayer(prev => ({ ...prev, x: Math.min(GAME_WIDTH - PLAYER_SIZE, prev.x + 20) }));
        break;
    }
  }, [gameState]);

  const shoot = () => {
    const newBullet = {
      id: Date.now() + Math.random(),
      x: player.x + player.size / 2,
      y: player.y,
      size: BULLET_SIZE,
      speed: 10,
      color: '#00FFFF'
    };
    setBullets(prev => [...prev, newBullet]);
  };

  // Mobile touch controls
  const handleTouch = (e) => {
    if (!gameAreaRef.current || gameState !== 'playing') return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const targetX = ((touch.clientX - rect.left) / rect.width) * GAME_WIDTH;
    
    setPlayer(prev => ({ ...prev, x: Math.max(0, Math.min(GAME_WIDTH - PLAYER_SIZE, targetX - PLAYER_SIZE/2)) }));
  };

  // Start/Restart game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setPlayer({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, size: PLAYER_SIZE });
    setBullets([]);
    setEnemies([]);
    setPowerUps([]);
    setParticles([]);
  };

  // Game UI
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black relative overflow-hidden">
      {/* Space Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-blue-900 to-black"></div>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          />
        ))}
      </div>

      {/* Game UI */}
      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 text-white">
          <div>
            <h1 className="text-3xl font-bold">🚀 Space Shooter</h1>
            <p className="text-sm">Player: {playerName || 'Guest'}</p>
          </div>
          
          <div className="text-right">
            <p className="text-xl font-bold">Score: {score}</p>
            <p className="text-sm">Level: {level} | Lives: {lives}</p>
          </div>
        </div>

        {/* Game Area */}
        <div 
          ref={gameAreaRef}
          className="relative mx-auto bg-black/50 rounded-lg border-2 border-blue-500/50 overflow-hidden cursor-crosshair"
          style={{ width: '100%', maxWidth: '800px', height: '500px' }}
          onTouchStart={handleTouch}
          onTouchMove={handleTouch}
          onClick={shoot}
        >
          {/* Player */}
          <motion.div
            className="absolute flex items-center justify-center text-2xl"
            style={{
              left: player.x,
              top: player.y,
              width: player.size,
              height: player.size
            }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            🚀
          </motion.div>

          {/* Bullets */}
          {bullets.map(bullet => (
            <motion.div
              key={bullet.id}
              className="absolute rounded-full"
              style={{
                left: bullet.x - bullet.size/2,
                top: bullet.y,
                width: bullet.size,
                height: bullet.size,
                backgroundColor: bullet.color,
                boxShadow: `0 0 10px ${bullet.color}`
              }}
            />
          ))}

          {/* Enemies */}
          {enemies.map(enemy => (
            <motion.div
              key={enemy.id}
              className="absolute flex items-center justify-center text-xl"
              style={{
                left: enemy.x,
                top: enemy.y,
                width: enemy.size,
                height: enemy.size
              }}
              animate={{ rotate: enemy.y * 2 }}
              transition={{ duration: 0.1 }}
            >
              {enemy.emoji}
            </motion.div>
          ))}

          {/* Power-ups */}
          {powerUps.map(powerUp => (
            <motion.div
              key={powerUp.id}
              className="absolute flex items-center justify-center text-lg rounded-full"
              style={{
                left: powerUp.x,
                top: powerUp.y,
                width: powerUp.size,
                height: powerUp.size,
                background: `linear-gradient(135deg, ${powerUp.color})`,
                boxShadow: `0 0 15px ${powerUp.color.split(' ')[1]}`
              }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {powerUp.emoji}
            </motion.div>
          ))}

          {/* Particles */}
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: particle.x,
                top: particle.y,
                width: 4,
                height: 4,
                backgroundColor: particle.color,
                opacity: particle.life / 30
              }}
            />
          ))}

          {/* Game State Overlays */}
          <AnimatePresence>
            {gameState === 'ready' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 flex items-center justify-center"
              >
                <div className="text-center text-white">
                  <h2 className="text-3xl font-bold mb-4">🚀 Space Shooter</h2>
                  <p className="mb-4">Defend Earth from alien invasion!</p>
                  <p className="text-sm mb-4">Use ← → to move, SPACE to shoot</p>
                  <button
                    onClick={startGame}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition-colors"
                  >
                    🚀 Start Mission
                  </button>
                </div>
              </motion.div>
            )}

            {gameState === 'failed' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 flex items-center justify-center"
              >
                <div className="text-center text-white">
                  <h2 className="text-3xl font-bold mb-4">💥 Mission Failed!</h2>
                  <p className="text-xl mb-2">Score: {score}</p>
                  <p className="text-lg mb-6">Level: {level}</p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={startGame}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => navigate('/game')}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Back to Games
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="text-center mt-4">
          {gameState === 'ready' && (
            <button
              onClick={startGame}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition-colors"
            >
              🚀 Start Mission
            </button>
          )}
        </div>

        {/* Mobile Controls */}
        {isMobile && gameState === 'playing' && (
          <div className="fixed bottom-4 left-4 right-4 lg:hidden">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setPlayer(prev => ({ ...prev, x: Math.max(0, prev.x - 30) }))}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
              >
                ←
              </button>
              <button
                onClick={shoot}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors font-bold"
              >
                🔫 SHOOT
              </button>
              <button
                onClick={() => setPlayer(prev => ({ ...prev, x: Math.min(GAME_WIDTH - PLAYER_SIZE, prev.x + 30) }))}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
              >
                →
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-4 text-white/60">
          <p>{isMobile ? 'Gunakan tombol untuk bergerak dan menembak' : 'Gunakan ← → untuk bergerak, SPACE untuk menembak'}</p>
        </div>
      </div>
    </div>
  );
};

export default SpaceShooterGame;

