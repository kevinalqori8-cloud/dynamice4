// src/Pages/game/SpaceShooter.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Trophy, Zap, Shield, Rocket } from 'lucide-react';
import './styles/SpaceShooter.css';

const SpaceShooter = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioRef = useRef(null);
  
  // Game state dengan sistem level dan power-ups
  const [gameState, setGameState] = useState({
    status: 'menu', // menu, playing, paused, gameOver
    score: 0,
    level: 1,
    lives: 3,
    combo: 0,
    powerUps: [],
    player: {
      x: 400,
      y: 500,
      width: 60,
      height: 60,
      speed: 5,
      health: 100,
      maxHealth: 100,
      hasShield: false,
      shieldTime: 0
    },
    bullets: [],
    enemies: [],
    particles: [],
    stars: []
  });

  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [difficulty, setDifficulty] = useState('normal');
  const [selectedShip, setSelectedShip] = useState('falcon');

  // Ship types dengan animasi dan efek visual
  const SHIP_TYPES = {
    falcon: { 
      color: '#00D4FF', 
      shape: 'triangle',
      speed: 5,
      health: 100,
      special: 'rapidFire'
    },
    phoenix: { 
      color: '#FF6B6B', 
      shape: 'diamond',
      speed: 7,
      health: 80,
      special: 'fireTrail'
    },
    titan: { 
      color: '#4ECDC4', 
      shape: 'hexagon',
      speed: 3,
      health: 150,
      special: 'shield'
    }
  };

  // Initialize game dengan animasi bintang dan partikel
  useEffect(() => {
    initializeStars();
    initializeParticles();
    
    // Background music
    audioRef.current = new Audio('/sounds/space-music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
  }, []);

  // Starfield animation
  const initializeStars = () => {
    const stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: Math.random() * 3,
        speed: Math.random() * 2 + 1,
        brightness: Math.random()
      });
    }
    setGameState(prev => ({ ...prev, stars }));
  };

  // Particle system untuk efek visual
  const initializeParticles = () => {
    const particles = [];
    setGameState(prev => ({ ...prev, particles }));
  };

  const createParticle = (x, y, color, type) => {
    const newParticles = [];
    for (let i = 0; i < 10; i++) {
      newParticles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color,
        size: Math.random() * 4 + 2,
        life: 30,
        type
      });
    }
    
    setGameState(prev => ({
      ...prev,
      particles: [...prev.particles, ...newParticles]
    }));
  };

  // Player movement dengan easing dan animasi smooth
  const movePlayer = useCallback((direction) => {
    if (gameState.status !== 'playing') return;

    setGameState(prev => {
      const newPlayer = { ...prev.player };
      const speed = newPlayer.speed;
      
      switch(direction) {
        case 'left':
          newPlayer.x = Math.max(0, newPlayer.x - speed);
          break;
        case 'right':
          newPlayer.x = Math.min(800 - newPlayer.width, newPlayer.x + speed);
          break;
        case 'up':
          newPlayer.y = Math.max(0, newPlayer.y - speed);
          break;
        case 'down':
          newPlayer.y = Math.min(600 - newPlayer.height, newPlayer.y + speed);
          break;
      }

      return { ...prev, player: newPlayer };
    });
  }, [gameState.status]);

  // Shooting system dengan animasi muzzle flash
  const shootBullet = useCallback(() => {
    if (gameState.status !== 'playing') return;

    const bullet = {
      id: Date.now() + Math.random(),
      x: gameState.player.x + gameState.player.width / 2 - 3,
      y: gameState.player.y,
      width: 6,
      height: 20,
      speed: 12,
      color: '#00FFFF',
      type: 'normal'
    };

    // Muzzle flash effect
    createParticle(bullet.x, bullet.y + 10, '#00FFFF', 'muzzle');

    setGameState(prev => ({
      ...prev,
      bullets: [...prev.bullets, bullet]
    }));

    // Play shoot sound
    playSound('shoot');
  }, [gameState.status, gameState.player]);

  // Enemy spawning dengan sistem level yang balanced
  const spawnEnemy = useCallback(() => {
    if (gameState.status !== 'playing') return;

    const enemy = {
      id: Date.now() + Math.random(),
      x: Math.random() * (800 - 50),
      y: -50,
      width: 50,
      height: 50,
      speed: 2 + (gameState.level * 0.3),
      health: 50 + (gameState.level * 10),
      maxHealth: 50 + (gameState.level * 10),
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      type: Math.random() < 0.8 ? 'normal' : 'elite',
      shootTimer: 0
    };

    setGameState(prev => ({
      ...prev,
      enemies: [...prev.enemies, enemy]
    }));

    // Schedule next spawn
    const spawnDelay = Math.max(500, 1500 - (gameState.level * 100));
    setTimeout(spawnEnemy, spawnDelay);
  }, [gameState.status, gameState.level]);

  // Collision detection yang akurat
  const checkCollisions = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev };
      
      // Bullet-enemy collisions
      const remainingBullets = [];
      const remainingEnemies = [];

      newState.bullets.forEach(bullet => {
        let bulletHit = false;
        
        newState.enemies.forEach(enemy => {
          if (bullet.x < enemy.x + enemy.width &&
              bullet.x + bullet.width > enemy.x &&
              bullet.y < enemy.y + enemy.height &&
              bullet.y + bullet.height > enemy.y) {
            
            bulletHit = true;
            enemy.health -= 25;
            
            // Explosion effect
            createParticle(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.color, 'explosion');
            
            if (enemy.health <= 0) {
              // Enemy destroyed
              newState.score += enemy.type === 'elite' ? 20 : 10;
              newState.combo += 1;
              
              // Combo bonus
              if (newState.combo > 5) {
                newState.score += newState.combo * 2;
              }
            } else {
              remainingEnemies.push(enemy);
            }
          } else {
            remainingEnemies.push(enemy);
          }
        });

        if (!bulletHit) {
          remainingBullets.push(bullet);
        }
      });

      // Player-enemy collisions
      remainingEnemies.forEach(enemy => {
        if (enemy.x < newState.player.x + newState.player.width &&
            enemy.x + enemy.width > newState.player.x &&
            enemy.y < newState.player.y + newState.player.height &&
            enemy.y + enemy.height > newState.player.y) {
          
          if (!newState.player.hasShield) {
            newState.player.health -= 20;
            createParticle(newState.player.x + newState.player.width/2, newState.player.y + newState.player.height/2, '#FF0000', 'damage');
            
            if (newState.player.health <= 0) {
              newState.status = 'gameOver';
              playSound('gameOver');
            }
          }
          
          // Remove enemy that hit player
          enemy.health = 0;
        }
      });

      return {
        ...newState,
        bullets: remainingBullets.filter(b => b.y > -20),
        enemies: remainingEnemies.filter(e => e.health > 0)
      };
    });
  }, []);

  // Game loop utama dengan delta time
  const gameLoop = useCallback(() => {
    if (gameState.status !== 'playing') return;

    // Update bullets
    setGameState(prev => ({
      ...prev,
      bullets: prev.bullets.map(bullet => ({
        ...bullet,
        y: bullet.y - bullet.speed
      })).filter(bullet => bullet.y > -20)
    }));

    // Update enemies
    setGameState(prev => ({
      ...prev,
      enemies: prev.enemies.map(enemy => ({
        ...enemy,
        y: enemy.y + enemy.speed,
        shootTimer: enemy.shootTimer + 1
      })).filter(enemy => enemy.y < 650)
    }));

    // Update particles
    setGameState(prev => ({
      ...prev,
      particles: prev.particles.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vx: particle.vx * 0.98,
        vy: particle.vy * 0.98,
        life: particle.life - 1
      })).filter(particle => particle.life > 0)
    }));

    // Update stars
    setGameState(prev => ({
      ...prev,
      stars: prev.stars.map(star => ({
        ...star,
        y: star.y + star.speed,
        brightness: Math.sin(Date.now() * 0.001 + star.x) * 0.5 + 0.5
      })).map(star => 
        star.y > 600 ? { ...star, y: -10, x: Math.random() * 800 } : star
      )
    }));

    // Spawn enemies
    if (Math.random() < 0.02 + (gameState.level * 0.005)) {
      spawnEnemy();
    }

    // Check collisions
    checkCollisions();

    // Level progression
    if (gameState.score > gameState.level * 100) {
      setGameState(prev => ({ ...prev, level: prev.level + 1 }));
      playSound('levelUp');
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.status, gameState.level, spawnEnemy, checkCollisions]);

  // Sound system dengan volume control
  const playSound = (soundType) => {
    if (!audioRef.current) return;
    
    const sounds = {
      shoot: '/sounds/laser.mp3',
      explosion: '/sounds/explosion.mp3',
      levelUp: '/sounds/level-up.mp3',
      gameOver: '/sounds/game-over.mp3'
    };

    const audio = new Audio(sounds[soundType]);
    audio.volume = volume;
    audio.play().catch(() => {});
  };

  // Start/Pause/Resume functions
  const startGame = () => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
    audioRef.current?.play();
    gameLoop();
    spawnEnemy();
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, status: 'paused' }));
    audioRef.current?.pause();
    cancelAnimationFrame(animationRef.current);
  };

  const resumeGame = () => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
    audioRef.current?.play();
    gameLoop();
  };

  const restartGame = () => {
    cancelAnimationFrame(animationRef.current);
    audioRef.current?.pause();
    audioRef.current.currentTime = 0;
    
    setGameState({
      status: 'menu',
      score: 0,
      level: 1,
      lives: 3,
      combo: 0,
      powerUps: [],
      player: {
        x: 400,
        y: 500,
        width: 60,
        height: 60,
        speed: 5,
        health: 100,
        maxHealth: 100,
        hasShield: false,
        shieldTime: 0
      },
      bullets: [],
      enemies: [],
      particles: [],
      stars: gameState.stars
    });
  };

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePlayer('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePlayer('right');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          movePlayer('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePlayer('down');
          break;
        case ' ':
          e.preventDefault();
          shootBullet();
          break;
        case 'p':
        case 'P':
          if (gameState.status === 'playing') pauseGame();
          else if (gameState.status === 'paused') resumeGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer, shootBullet, gameState.status]);

  // Touch controls untuk mobile dengan swipe gesture
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;

    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;

      const deltaX = endX - startX;
      const deltaY = endY - startY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 50) movePlayer('right');
        else if (deltaX < -50) movePlayer('left');
      } else {
        // Vertical swipe
        if (deltaY > 50) movePlayer('down');
        else if (deltaY < -50) movePlayer('up');
      }

      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchend', handleTouchEnd);
  };

  // Render game canvas
  const renderCanvas = () => {
    const canvas = document.getElementById('space-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas dengan gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Draw stars with twinkling effect
    gameState.stars.forEach(star => {
      ctx.save();
      ctx.globalAlpha = star.brightness;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw particles
    gameState.particles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.life / 30;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw player dengan animasi shield
    const player = gameState.player;
    ctx.save();
    
    // Shield effect
    if (player.hasShield) {
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(player.x + player.width/2, player.y + player.height/2, player.width/2 + 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Player ship
    ctx.fillStyle = SHIP_TYPES[selectedShip].color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width/2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();

    // Draw bullets dengan glow effect
    gameState.bullets.forEach(bullet => {
      ctx.save();
      ctx.shadowColor = bullet.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = bullet.color;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      ctx.restore();
    });

    // Draw enemies dengan animasi
    gameState.enemies.forEach(enemy => {
      ctx.save();
      ctx.fillStyle = enemy.color;
      
      // Enemy shape based on type
      if (enemy.type === 'elite') {
        // Diamond shape for elite enemies
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width/2, enemy.y);
        ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height/2);
        ctx.lineTo(enemy.x + enemy.width/2, enemy.y + enemy.height);
        ctx.lineTo(enemy.x, enemy.y + enemy.height/2);
        ctx.closePath();
        ctx.fill();
      } else {
        // Circle for normal enemies
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Health bar
      const healthPercent = enemy.health / enemy.maxHealth;
      ctx.fillStyle = '#333';
      ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 4);
      ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : '#FF5722';
      ctx.fillRect(enemy.x, enemy.y - 10, enemy.width * healthPercent, 4);
      
      ctx.restore();
    });
  };

  // Main UI dengan animasi lucu
  return (
    <div className="space-shooter-container">
      {/* Animated Background */}
      <div className="animated-bg">
        {gameState.stars.map((star, i) => (
          <motion.div
            key={i}
            className="star"
            style={{
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size
            }}
            animate={{
              opacity: [star.brightness * 0.3, star.brightness, star.brightness * 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Game Header dengan animasi */}
      <motion.div 
        className="game-header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="header-left">
          <motion.h1 
            className="game-title"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🚀 Galactic Guardian
          </motion.h1>
          <div className="level-indicator">
            <span>Level {gameState.level}</span>
            <div className="level-bar">
              <motion.div 
                className="level-progress"
                initial={{ width: 0 }}
                animate={{ width: `${(gameState.score % 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <div className="score-display">
            <motion.span 
              key={gameState.score}
              initial={{ scale: 1.5, color: '#FFD700' }}
              animate={{ scale: 1, color: '#FFFFFF' }}
              transition={{ duration: 0.3 }}
            >
              💎 {gameState.score.toLocaleString()}
            </motion.span>
          </div>
          
          <div className="combo-display">
            {gameState.combo > 5 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="combo-text"
              >
                🔥 COMBO x{gameState.combo}!
              </motion.div>
            )}
          </div>

          <div className="lives-display">
            {[...Array(gameState.lives)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring" }}
                className="life-icon"
              >
                ❤️
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Game Area */}
      <div className="game-area">
        <canvas
          id="space-canvas"
          ref={canvasRef}
          width={800}
          height={600}
          className="game-canvas"
          onTouchStart={handleTouchStart}
        />

        {/* Player Health Bar */}
        <div className="player-health-bar">
          <div className="health-label">Player Health</div>
          <div className="health-bar-container">
            <motion.div 
              className="health-bar"
              initial={{ width: '100%' }}
              animate={{ width: `${gameState.player.health}%` }}
              transition={{ duration: 0.3 }}
              style={{ 
                backgroundColor: gameState.player.health > 50 ? '#4CAF50' : 
                               gameState.player.health > 25 ? '#FF9800' : '#F44336'
              }}
            />
          </div>
        </div>

        {/* Power-ups Display */}
        <div className="power-ups-display">
          {gameState.powerUps.map((powerUp, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="power-up-icon"
              style={{ backgroundColor: powerUp.color }}
            >
              {powerUp.icon}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Control Buttons dengan animasi lucu */}
      <motion.div 
        className="control-panel"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        {gameState.status === 'menu' && (
          <div className="menu-screen">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="menu-content"
            >
              <div className="ship-selection">
                <h3>Pilih Pesawatmu! ✨</h3>
                <div className="ship-options">
                  {Object.entries(SHIP_TYPES).map(([key, ship]) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedShip(key)}
                      className={`ship-option ${selectedShip === key ? 'selected' : ''}`}
                      style={{ borderColor: ship.color }}
                    >
                      <div className="ship-preview" style={{ backgroundColor: ship.color }}></div>
                      <div className="ship-name">{key}</div>
                      <div className="ship-stats">
                        <span>Speed: {ship.speed}</span>
                        <span>Health: {ship.health}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="start-button"
              >
                <Rocket className="icon" />
                Mulai Petualangan!
              </motion.button>
            </motion.div>
          </div>
        )}

        {gameState.status === 'playing' && (
          <div className="game-controls">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={pauseGame}
              className="control-btn pause"
            >
              <Pause className="icon" />
            </motion.button>

            <div className="touch-controls">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => movePlayer('left')}
                className="direction-btn"
              >
                ←
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => movePlayer('up')}
                className="direction-btn"
              >
                ↑
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={shootBullet}
                className="shoot-btn"
              >
                <Zap className="icon" />
                TEMBAK!
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => movePlayer('down')}
                className="direction-btn"
              >
                ↓
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => movePlayer('right')}
                className="direction-btn"
              >
                →
              </motion.button>
            </div>
          </div>
        )}

        {gameState.status === 'paused' && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="pause-screen"
          >
            <h3>⏸️ Game Dijeda</h3>
            <div className="pause-buttons">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resumeGame}
                className="resume-btn"
              >
                <Play className="icon" />
                Lanjutkan
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={restartGame}
                className="restart-btn"
              >
                <RotateCcw className="icon" />
                Ulangi
              </motion.button>
            </div>
          </motion.div>
        )}

        {gameState.status === 'gameOver' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="game-over-screen"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="game-over-icon"
            >
              💥
            </motion.div>
            <h3>Game Over!</h3>
            <div className="final-stats">
              <div className="stat-item">
                <Trophy className="icon" />
                <span>Score: {gameState.score.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <Zap className="icon" />
                <span>Level: {gameState.level}</span>
              </div>
              <div className="stat-item">
                <Shield className="icon" />
                <span>Combo Tertinggi: {gameState.combo}</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={restartGame}
              className="restart-button"
            >
              <RotateCcw className="icon" />
              Main Lagi
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="settings-panel"
          >
            <h4>Pengaturan 🔧</h4>
            
            <div className="setting-item">
              <label>Volume Musik</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
              />
              <span>{Math.round(volume * 100)}%</span>
            </div>

            <div className="setting-item">
              <label>Kesulitan</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Mudah 😊</option>
                <option value="normal">Normal 😐</option>
                <option value="hard">Sulit 😈</option>
              </select>
            </div>

            <button onClick={() => setShowSettings(false)} className="close-settings">
              Tutup
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowSettings(!showSettings)}
        className="settings-toggle"
      >
        ⚙️
      </motion.button>
    </div>
  );
};

export default SpaceShooter;

