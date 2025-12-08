// src/Pages/game/Fishit.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Trophy, Zap, Heart, Sparkles, Waves, Fish } from 'lucide-react';
import './styles/Fishit.css';

const Fishit = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioRef = useRef(null);
  
  // Game state dengan tema underwater rainbow
  const [gameState, setGameState] = useState({
    status: 'menu', // menu, playing, paused, gameOver
    score: 0,
    level: 1,
    lives: 3,
    combo: 0,
    rainbowMode: false,
    rainbowTimer: 0,
    powerUps: [],
    particles: [],
    bubbles: []
  });

  const [hook, setHook] = useState({
    x: 400,
    y: 100,
    width: 20,
    height: 20,
    targetX: 400,
    targetY: 100,
    speed: 5,
    isCasting: false,
    isReeling: false,
    caughtFish: null
  });

  const [fish, setFish] = useState([]);
  const [ocean, setOcean] = useState({
    waves: [],
    depth: 600,
    current: 0
  });

  const [selectedRod, setSelectedRod] = useState('rainbow');
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [difficulty, setDifficulty] = useState('normal');

  // Fishing rod themes dengan animasi dan efek visual
  const ROD_THEMES = {
    rainbow: {
      name: '🌈 Rainbow Rod',
      colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
      castingSpeed: 5,
      special: 'rainbow-lure'
    },
    neon: {
      name: '⚡ Neon Rod',
      colors: ['#00FFFF', '#FF00FF', '#FFFF00'],
      castingSpeed: 6,
      special: 'glow-lure'
    },
    galaxy: {
      name: '🌌 Galaxy Rod',
      colors: ['#9D4EDD', '#C77DFF', '#E0AAFF'],
      castingSpeed: 4,
      special: 'star-lure'
    },
    golden: {
      name: '⭐ Golden Rod',
      colors: ['#FFD700', '#FFA500', '#FFFF00'],
      castingSpeed: 7,
      special: 'golden-lure'
    }
  };

  // Fish types dengan animasi dan efek khusus
  const FISH_TYPES = {
    normal: {
      name: '🐟 Normal Fish',
      points: 10,
      size: 30,
      color: '#FF6B6B',
      speed: 2,
      rarity: 'common',
      effect: 'none'
    },
    rare: {
      name: '🐠 Rare Fish',
      points: 25,
      size: 35,
      color: '#4ECDC4',
      speed: 3,
      rarity: 'uncommon',
      effect: 'speed-boost'
    },
    legendary: {
      name: '🐡 Legendary Fish',
      points: 50,
      size: 40,
      color: '#9D4EDD',
      speed: 4,
      rarity: 'rare',
      effect: 'legendary-bonus'
    },
    rainbow: {
      name: '🌈 Rainbow Fish',
      points: 100,
      size: 45,
      color: 'rainbow',
      speed: 5,
      rarity: 'ultra-rare',
      effect: 'rainbow-mode'
    },
    whale: {
      name: '🐋 Whale',
      points: 200,
      size: 80,
      color: '#4169E1',
      speed: 1,
      rarity: 'epic',
      effect: 'mega-bonus'
    }
  };

  // Power-ups dengan animasi dan efek spesial
  const POWER_UPS = {
    magnet: {
      name: '🧲 Fish Magnet',
      duration: 8000,
      effect: 'attract-fish',
      color: '#FFD700'
    },
    net: {
      name: '🕸️ Super Net',
      duration: 6000,
      effect: 'catch-multiple',
      color: '#FF6B6B'
    },
    radar: {
      name: '📡 Fish Radar',
      duration: 10000,
      effect: 'reveal-rare',
      color: '#00FFFF'
    },
    storm: {
      name: '⛈️ Rainbow Storm',
      duration: 12000,
      effect: 'rainbow-fish',
      color: '#FF69B4'
    }
  };

  // Initialize game dengan animasi dan efek visual
  useEffect(() => {
    initializeOcean();
    initializeBubbles();
    initializeParticles();
    
    // Background music
    audioRef.current = new Audio('/sounds/underwater-music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
  }, []);

  // Initialize ocean dengan waves dan current
  const initializeOcean = () => {
    const waves = [];
    for (let i = 0; i < 20; i++) {
      waves.push({
        x: i * 50,
        y: 100 + Math.sin(i * 0.5) * 20,
        amplitude: Math.random() * 10 + 5,
        frequency: Math.random() * 0.1 + 0.05,
        phase: Math.random() * Math.PI * 2
      });
    }
    setOcean(prev => ({ ...prev, waves }));
  };

  // Initialize bubbles dengan animasi
  const initializeBubbles = () => {
    const bubbles = [];
    for (let i = 0; i < 15; i++) {
      bubbles.push({
        x: Math.random() * 800,
        y: Math.random() * 500 + 100,
        size: Math.random() * 20 + 10,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        wobble: Math.random() * 2 - 1
      });
    }
    setGameState(prev => ({ ...prev, bubbles }));
  };

  // Particle system untuk efek visual underwater
  const createWaterParticles = (x, y, color, count = 15) => {
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        id: Date.now() + i,
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2, // Upward bias
        color,
        size: Math.random() * 8 + 3,
        life: 40,
        type: 'water-effect',
        float: true
      });
    }
    
    setGameState(prev => ({
      ...prev,
      particles: [...prev.particles, ...particles]
    }));
  };

  // Casting system dengan animasi smooth dan efek visual
  const castLine = useCallback((targetX, targetY) => {
    if (hook.isCasting || gameState.status !== 'playing') return;

    setHook(prev => ({
      ...prev,
      targetX: Math.max(20, Math.min(780, targetX)),
      targetY: Math.max(150, Math.min(550, targetY)),
      isCasting: true,
      isReeling: false
    }));

    // Create casting particles
    createWaterParticles(hook.x, hook.y, '#FFFFFF', 10);
    playSound('cast');
  }, [hook.isCasting, gameState.status, hook.x, hook.y]);

  // Reeling system dengan animasi
  const reelIn = useCallback(() => {
    if (!hook.isCasting || hook.isReeling) return;

    setHook(prev => ({ ...prev, isReeling: true }));
    playSound('reel');
  }, [hook.isCasting, hook.isReeling]);

  // Fish movement dengan AI yang realistis dan schooling behavior
  const updateFish = useCallback(() => {
    if (gameState.status !== 'playing') return;

    setFish(prevFish => prevFish.map(fishItem => {
      let newX = fishItem.x + fishItem.direction * fishItem.speed;
      let newY = fishItem.y + Math.sin(Date.now() * 0.001 + fishItem.id) * 0.5;
      
      // Boundary checking
      if (newX <= 0 || newX >= 800 - fishItem.size) {
        fishItem.direction *= -1;
        newX = fishItem.x + fishItem.direction * fishItem.speed;
      }
      
      // Vertical boundaries
      if (newY <= 120) newY = 120;
      if (newY >= 580 - fishItem.size) newY = 580 - fishItem.size;
      
      // Schooling behavior - fish try to stay together
      const nearbyFish = prevFish.filter(f => 
        f.id !== fishItem.id && 
        Math.abs(f.x - fishItem.x) < 100 && 
        Math.abs(f.y - fishItem.y) < 50
      );
      
      if (nearbyFish.length > 0) {
        const avgX = nearbyFish.reduce((sum, f) => sum + f.x, 0) / nearbyFish.length;
        const avgY = nearbyFish.reduce((sum, f) => sum + f.y, 0) / nearbyFish.length;
        
        // Move towards group
        if (avgX > fishItem.x) fishItem.direction = 1;
        else if (avgX < fishItem.x) fishItem.direction = -1;
        
        newY += (avgY - fishItem.y) * 0.1;
      }
      
      return {
        ...fishItem,
        x: newX,
        y: newY
      };
    }));
  }, [gameState.status]);

  // Fish spawning dengan sistem level yang balanced
  const spawnFish = useCallback(() => {
    if (gameState.status !== 'playing') return;

    const types = Object.keys(FISH_TYPES);
    const weights = [0.6, 0.25, 0.1, 0.04, 0.01]; // Normal distribution
    const randomType = weightedRandom(types, weights);
    
    const fishType = FISH_TYPES[randomType];
    const newFish = {
      id: Date.now() + Math.random(),
      x: Math.random() > 0.5 ? -50 : 850,
      y: 150 + Math.random() * 400,
      direction: Math.random() > 0.5 ? 1 : -1,
      ...fishType,
      caught: false,
      lured: false,
      schoolId: Math.floor(Math.random() * 5)
    };

    setFish(prev => [...prev, newFish]);

    // Schedule next spawn
    const spawnDelay = Math.max(800, 1500 - (gameState.level * 100));
    setTimeout(spawnFish, spawnDelay + Math.random() * 1000);
  }, [gameState.status, gameState.level]);

  // Weighted random selection
  const weightedRandom = (items, weights) => {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) return items[i];
    }
    return items[items.length - 1];
  };

  // Hook movement dengan animasi smooth
  const updateHook = useCallback(() => {
    if (!hook.isCasting || gameState.status !== 'playing') return;

    const dx = hook.targetX - hook.x;
    const dy = hook.targetY - hook.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      // Hook reached target
      if (hook.isReeling) {
        // Check for fish catch
        checkFishCatch();
      }
      setHook(prev => ({ ...prev, isCasting: false, isReeling: false }));
    } else {
      const speed = hook.isReeling ? ROD_THEMES[selectedRod].castingSpeed * 1.5 : ROD_THEMES[selectedRod].castingSpeed;
      setHook(prev => ({
        ...prev,
        x: prev.x + (dx / distance) * speed,
        y: prev.y + (dy / distance) * speed
      }));
    }
  }, [hook.isCasting, hook.isReeling, hook.targetX, hook.targetY, hook.x, hook.y, selectedRod, gameState.status]);

  // Fish catching detection dengan efek visual
  const checkFishCatch = useCallback(() => {
    fish.forEach(fishItem => {
      if (fishItem.caught) return;

      const distance = Math.sqrt(
        Math.pow(hook.x - fishItem.x, 2) + Math.pow(hook.y - fishItem.y, 2)
      );

      if (distance < fishItem.size / 2 + 15) {
        // Fish caught!
        fishItem.caught = true;
        
        setHook(prev => ({ ...prev, caughtFish: fishItem }));
        
        // Create catching particles
        createWaterParticles(fishItem.x, fishItem.y, fishItem.color, 20);
        
        // Update score
        setGameState(prev => ({
          ...prev,
          score: prev.score + fishItem.points,
          combo: prev.combo + 1
        }));
        
        playSound('catch');
        
        // Remove fish after delay
        setTimeout(() => {
          setFish(prev => prev.filter(f => f.id !== fishItem.id));
          setHook(prev => ({ ...prev, caughtFish: null }));
        }, 1000);
      }
    });
  }, [hook.x, hook.y, fish]);

  // Canvas rendering dengan animasi smooth
  const renderCanvas = () => {
    const canvas = document.getElementById('fishit-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas dengan underwater gradient
    const gradient = ctx.createLinearGradient(0, 100, 0, 600);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#4682B4');
    gradient.addColorStop(1, '#191970');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Draw ocean waves dengan animasi
    ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
    ocean.waves.forEach((wave, i) => {
      const time = Date.now() * 0.001;
      const waveY = wave.y + Math.sin(time * wave.frequency + wave.phase) * wave.amplitude;
      
      ctx.beginPath();
      ctx.moveTo(wave.x, waveY);
      ctx.quadraticCurveTo(
        wave.x + 25, 
        waveY - wave.amplitude,
        wave.x + 50, 
        waveY
      );
      ctx.lineTo(wave.x + 50, 100);
      ctx.lineTo(wave.x, 100);
      ctx.closePath();
      ctx.fill();
    });

    // Draw bubbles dengan animasi
    gameState.bubbles.forEach(bubble => {
      ctx.save();
      ctx.globalAlpha = bubble.opacity;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        bubble.x + Math.sin(Date.now() * 0.001 + bubble.x) * bubble.wobble,
        bubble.y,
        bubble.size,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.restore();
      
      // Update bubble position
      bubble.y -= bubble.speed;
      bubble.x += Math.sin(Date.now() * 0.002 + bubble.x) * 0.5;
      
      if (bubble.y < 100) {
        bubble.y = 600;
        bubble.x = Math.random() * 800;
      }
    });

    // Draw fish dengan animasi dan efek visual
    fish.forEach(fishItem => {
      if (fishItem.caught) return;

      ctx.save();
      
      // Fish shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(fishItem.x + 3, fishItem.y + fishItem.size - 3, fishItem.size/2, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Fish body
      if (fishItem.type === 'rainbow') {
        // Rainbow gradient
        const gradient = ctx.createLinearGradient(
          fishItem.x - fishItem.size/2, 
          fishItem.y, 
          fishItem.x + fishItem.size/2, 
          fishItem.y
        );
        DINO_THEMES.rainbow.colors.forEach((color, i) => {
          gradient.addColorStop(i / (DINO_THEMES.rainbow.colors.length - 1), color);
        });
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = fishItem.color;
      }
      
      // Fish shape
      ctx.beginPath();
      ctx.ellipse(fishItem.x, fishItem.y, fishItem.size/2, fishItem.size/3, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Fish tail
      ctx.beginPath();
      ctx.moveTo(fishItem.x - fishItem.size/2, fishItem.y);
      ctx.lineTo(fishItem.x - fishItem.size, fishItem.y - fishItem.size/4);
      ctx.lineTo(fishItem.x - fishItem.size, fishItem.y + fishItem.size/4);
      ctx.closePath();
      ctx.fill();
      
      // Fish eye
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(fishItem.x + fishItem.size/4, fishItem.y - fishItem.size/6, 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(fishItem.x + fishItem.size/4, fishItem.y - fishItem.size/6, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Fish emoji
      ctx.font = `${fishItem.size * 0.8}px Arial`;
      ctx.fillText(FOOD_TYPES[fishItem.type].emoji, fishItem.x - fishItem.size/4, fishItem.y + 5);
      
      ctx.restore();
    });

    // Draw hook dengan animasi
    ctx.save();
    
    // Fishing line
    ctx.strokeStyle = ROD_THEMES[selectedRod].colors[0];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(400, 100);
    ctx.lineTo(hook.x, hook.y);
    ctx.stroke();
    
    // Hook
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.arc(hook.x, hook.y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Hook glow effect
    if (hook.isCasting) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hook.x, hook.y, 12, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Caught fish
    if (hook.caughtFish) {
      ctx.save();
      ctx.fillStyle = hook.caughtFish.color;
      ctx.beginPath();
      ctx.arc(hook.x, hook.y - 15, hook.caughtFish.size/3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    ctx.restore();

    // Draw power-ups dengan animasi
    gameState.powerUps.forEach(powerUp => {
      ctx.save();
      
      // Glow effect
      ctx.shadowColor = powerUp.color;
      ctx.shadowBlur = 15;
      
      // Power-up shape (bubble-like)
      ctx.fillStyle = powerUp.color;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, powerUp.width/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Icon
      ctx.font = `${powerUp.height * 0.6}px Arial`;
      ctx.fillText(powerUp.name.split(' ')[0], powerUp.x + 5, powerUp.y + powerUp.height/2 + 5);
      
      ctx.restore();
    });

    // Draw particles
    gameState.particles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.life / 40;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };

  // Main UI dengan animasi lucu dan tema underwater
  return (
    <div className="fishit-container">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="ocean-gradient"></div>
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="floating-fish"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 25 + 20}px`
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {['🐟', '🐠', '🐡', '🦈', '🐙', '🦀'][i % 6]}
          </motion.div>
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
            animate={{ 
              color: ROD_THEMES[selectedRod].colors
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌈 Rainbow Fishing Frenzy
          </motion.h1>
          
          <div className="rod-selection">
            <span>Pilih Pancing: </span>
            <select 
              value={selectedRod} 
              onChange={(e) => setSelectedRod(e.target.value)}
              className="rod-select"
            >
              {Object.entries(ROD_THEMES).map(([key, theme]) => (
                <option key={key} value={key}>{theme.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="header-right">
          <div className="score-display">
            <motion.span 
              key={gameState.score}
              initial={{ scale: 1.5, rotate: 360 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="score-number"
              style={{ color: ROD_THEMES[selectedRod].colors[0] }}
            >
              🎣 {gameState.score.toLocaleString()}
            </motion.span>
          </div>
          
          <div className="level-display">
            <span>Level {gameState.level}</span>
            <div className="level-bar">
              <motion.div 
                className="level-progress"
                initial={{ width: 0 }}
                animate={{ width: `${(gameState.score % 200)}%` }}
                transition={{ duration: 0.5 }}
                style={{ 
                  background: `linear-gradient(90deg, ${ROD_THEMES[selectedRod].colors.join(', ')})`
                }}
              />
            </div>
          </div>

          <div className="combo-display">
            {gameState.combo > 3 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="combo-text"
                style={{ color: ROD_THEMES[selectedRod].colors[0] }}
              >
                🎣 COMBO x{gameState.combo}!
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Game Area */}
      <div className="game-area">
        <canvas
          id="fishit-canvas"
          ref={canvasRef}
          width={800}
          height={600}
          className="game-canvas"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            castLine(x, y);
          }}
        />

        {/* Ocean Surface */}
        <div className="ocean-surface">
          <motion.div
            className="wave-animation"
            animate={{
              x: [0, -100, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        {/* Player Stats */}
        <div className="player-stats">
          <div className="lives-display">
            {[...Array(gameState.lives)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring" }}
                className="life-icon"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              >
                💙
              </motion.div>
            ))}
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
              style={{ 
                backgroundColor: powerUp.color,
                boxShadow: `0 0 20px ${powerUp.color}`
              }}
            >
              {powerUp.name.split(' ')[0]}
            </motion.div>
          ))}
        </div>

        {/* Rainbow Mode Overlay */}
        <AnimatePresence>
          {gameState.rainbowMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="rainbow-mode-overlay"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="rainbow-text"
              >
                🌈 RAINBOW FISHING MODE! 🌈
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="menu-fisher"
            >
              🎣
            </motion.div>
            
            <h2>Selamat Datang di Rainbow Fishing!</h2>
            <p>Casting, tangkap ikan, dan kumpulkan rainbow bersama kail pancing! 🌈</p>
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={startGame}
              className="start-button"
              style={{ 
                background: `linear-gradient(45deg, ${ROD_THEMES[selectedRod].colors.join(', ')})`
              }}
            >
              <Play className="icon" />
              Mulai Memancing!
            </motion.button>

            <div className="menu-instructions">
              <p><strong>🎮 Kontrol:</strong></p>
              <p>• Klik untuk casting kail</p>
              <p>• Klik lagi untuk reel in</p>
              <p>• Tangkap ikan rainbow untuk efek spesial!</p>
            </div>
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

            <div className="casting-controls">
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: '#4ECDC4' }}
                whileTap={{ scale: 0.9 }}
                onClick={reelIn}
                disabled={!hook.isCasting}
                className="reel-btn"
              >
                <Waves className="icon" />
                REEL IN!
              </motion.button>
              
              <div className="casting-instructions">
                <p>Klik di area permainan untuk casting!</p>
                <p>🎯 Target: Ikan berwarna-warni</p>
              </div>
            </div>
          </div>
        )}

        {gameState.status === 'paused' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="pause-screen"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="pause-icon"
            >
              ⏸️
            </motion.div>
            <h3>Game Dijeda</h3>
            <p>Ikan sedang menunggu... 🐟💤</p>
            <button onClick={resumeGame} className="resume-btn">
              <Play className="icon" />
              Lanjutkan
            </button>
          </motion.div>
        )}

        {gameState.status === 'gameOver' && (
          <motion.div
            initial={{ scale: 0, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="game-over-screen"
          >
            <motion.div
              animate={{ 
                rotate: [0, -20, 20, -20, 0],
                y: [0, -40, 0]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="sad-fisher"
            >
              🎣😢
            </motion.div>
            
            <h3>Oh Tidak! Pancing Putus!</h3>
            
            <div className="final-stats">
              <motion.div 
                className="stat-item"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Trophy className="icon" />
                <span>Score: {gameState.score.toLocaleString()}</span>
              </motion.div>
              
              <motion.div 
                className="stat-item"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Fish className="icon" />
                <span>Level: {gameState.level}</span>
              </motion.div>
              
              <motion.div 
                className="stat-item"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Sparkles className="icon" />
                <span>Combo: {gameState.combo}</span>
              </motion.div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={restartGame}
              className="restart-button"
              style={{ 
                background: `linear-gradient(45deg, ${ROD_THEMES[selectedRod].colors.join(', ')})`
              }}
            >
              <RotateCcw className="icon" />
              Coba Lagi
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Settings Toggle */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowSettings(!showSettings)}
        className="settings-toggle"
      >
        ⚙️
      </motion.button>
    </div>
  );
};

export default Fishit;

