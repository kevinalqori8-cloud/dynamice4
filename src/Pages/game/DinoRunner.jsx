// src/Pages/game/DinoRunner.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Trophy, Zap, Heart, Sparkles } from 'lucide-react';
import './styles/DinoRunner.css';

const DinoRunner = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioRef = useRef(null);
  
  // Game state dengan tema rainbow dan power-ups
  const [gameState, setGameState] = useState({
    status: 'menu', // menu, playing, paused, gameOver
    score: 0,
    level: 1,
    lives: 3,
    combo: 0,
    rainbowMode: false,
    rainbowTimer: 0,
    powerUps: [],
    particles: []
  });

  const [dino, setDino] = useState({
    x: 100,
    y: 300,
    width: 50,
    height: 50,
    velocityY: 0,
    isJumping: false,
    isDucking: false,
    color: '#FF6B6B',
    rainbowTrail: []
  });

  const [obstacles, setObstacles] = useState([]);
  const [clouds, setClouds] = useState([]);
  const [ground, setGround] = useState({ y: 350, segments: [] });

  const [selectedDino, setSelectedDino] = useState('rainbow');
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [difficulty, setDifficulty] = useState('normal');

  // Dino themes dengan animasi dan efek visual
  const DINO_THEMES = {
    rainbow: {
      name: '🌈 Rainbow Dino',
      colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
      jumpPower: -12,
      special: 'rainbow-trail'
    },
    neon: {
      name: '⚡ Neon Dino',
      colors: ['#00FFFF', '#FF00FF', '#FFFF00'],
      jumpPower: -14,
      special: 'glow-effect'
    },
    galaxy: {
      name: '🌌 Galaxy Dino',
      colors: ['#9D4EDD', '#C77DFF', '#E0AAFF'],
      jumpPower: -10,
      special: 'star-particles'
    },
    fire: {
      name: '🔥 Fire Dino',
      colors: ['#FF4500', '#FF6347', '#FFD700'],
      jumpPower: -15,
      special: 'fire-trail'
    }
  };

  // Obstacle types dengan animasi dan efek
  const OBSTACLE_TYPES = {
    cactus: { 
      width: 40, 
      height: 60, 
      color: '#228B22', 
      emoji: '🌵',
      points: 10,
      effect: 'none'
    },
    bird: { 
      width: 50, 
      height: 40, 
      color: '#FF6B6B', 
      emoji: '🦅',
      points: 20,
      effect: 'fly-high'
    },
    rock: { 
      width: 45, 
      height: 45, 
      color: '#8B4513', 
      emoji: '🪨',
      points: 15,
      effect: 'duck-required'
    },
    rainbow: { 
      width: 60, 
      height: 50, 
      color: '#FF69B4', 
      emoji: '🌈',
      points: 50,
      effect: 'bonus-points'
    }
  };

  // Power-ups dengan animasi dan efek spesial
  const POWER_UPS = {
    magnet: {
      name: '🧲 Magnet',
      duration: 5000,
      effect: 'attract-food',
      color: '#FFD700'
    },
    shield: {
      name: '🛡️ Shield',
      duration: 8000,
      effect: 'invincible',
      color: '#00FFFF'
    },
    speed: {
      name: '⚡ Speed Boost',
      duration: 6000,
      effect: 'double-speed',
      color: '#FF00FF'
    },
    rainbow: {
      name: '🌈 Rainbow Mode',
      duration: 10000,
      effect: 'rainbow-trail',
      color: '#FF69B4'
    }
  };

  // Initialize game dengan animasi dan efek visual
  useEffect(() => {
    initializeGround();
    initializeClouds();
    initializeParticles();
    
    // Background music
    audioRef.current = new Audio('/sounds/dino-music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
  }, []);

  // Initialize ground dengan segments
  const initializeGround = () => {
    const segments = [];
    for (let i = 0; i < 50; i++) {
      segments.push({
        x: i * 40,
        height: Math.random() * 10 + 5,
        color: `hsl(${120 + Math.random() * 30}, 70%, 50%)`
      });
    }
    setGround(prev => ({ ...prev, segments }));
  };

  // Initialize clouds dengan animasi
  const initializeClouds = () => {
    const clouds = [];
    for (let i = 0; i < 8; i++) {
      clouds.push({
        x: Math.random() * 1000,
        y: Math.random() * 200 + 50,
        size: Math.random() * 40 + 30,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        emoji: ['☁️', '⛅', '🌤️'][Math.floor(Math.random() * 3)]
      });
    }
    setClouds(clouds);
  };

  // Particle system untuk efek visual
  const createParticles = (x, y, color, count = 10) => {
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        id: Date.now() + i,
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        color,
        size: Math.random() * 6 + 2,
        life: 30,
        type: 'effect'
      });
    }
    
    setGameState(prev => ({
      ...prev,
      particles: [...prev.particles, ...particles]
    }));
  };

  // Rainbow trail effect untuk dino
  const createRainbowTrail = (x, y) => {
    if (!gameState.rainbowMode) return;

    const colors = DINO_THEMES.rainbow.colors;
    const trailParticles = [];
    
    for (let i = 0; i < 7; i++) {
      trailParticles.push({
        id: Date.now() + i,
        x: x + Math.random() * 20 - 10,
        y: y + Math.random() * 20 - 10,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        color: colors[i % colors.length],
        size: Math.random() * 4 + 1,
        life: 25,
        type: 'rainbow-trail'
      });
    }
    
    setGameState(prev => ({
      ...prev,
      particles: [...prev.particles, ...trailParticles]
    }));
  };

  // Jump system dengan animasi smooth dan efek visual
  const jump = useCallback(() => {
    if (dino.isJumping || gameState.status !== 'playing') return;

    setDino(prev => ({
      ...prev,
      velocityY: DINO_THEMES[selectedDino].jumpPower,
      isJumping: true
    }));

    // Create jump particles
    createParticles(dino.x + dino.width/2, dino.y + dino.height, '#FFFFFF', 8);
    
    // Rainbow trail
    createRainbowTrail(dino.x, dino.y);
    
    playSound('jump');
  }, [dino.isJumping, gameState.status, selectedDino, dino.x, dino.y]);

  // Duck system
  const duck = useCallback((isDucking) => {
    if (gameState.status !== 'playing') return;

    setDino(prev => ({
      ...prev,
      isDucking: isDucking,
      height: isDucking ? 25 : 50
    }));
  }, [gameState.status]);

  // Spawn obstacles dengan sistem level yang balanced
  const spawnObstacle = useCallback(() => {
    if (gameState.status !== 'playing') return;

    const types = Object.keys(OBSTACLE_TYPES);
    const weights = [0.5, 0.2, 0.2, 0.1]; // Normal distribution
    const randomType = weightedRandom(types, weights);
    
    const obstacle = {
      id: Date.now() + Math.random(),
      x: 850,
      y: randomType === 'bird' ? Math.random() * 200 + 100 : 300,
      ...OBSTACLE_TYPES[randomType],
      speed: 5 + (gameState.level * 0.5) + Math.random() * 2,
      passed: false
    };

    setObstacles(prev => [...prev, obstacle]);

    // Schedule next spawn
    const spawnDelay = Math.max(1000, 2000 - (gameState.level * 100));
    setTimeout(spawnObstacle, spawnDelay + Math.random() * 1000);
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

  // Power-up spawning
  const spawnPowerUp = useCallback(() => {
    if (gameState.status !== 'playing') return;
    if (Math.random() < 0.05) { // 5% chance
      
      const types = Object.keys(POWER_UPS);
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const powerUp = {
        id: Date.now() + Math.random(),
        x: 850,
        y: 200 + Math.random() * 100,
        width: 40,
        height: 40,
        type: randomType,
        ...POWER_UPS[randomType],
        speed: 3
      };

      setGameState(prev => ({
        ...prev,
        powerUps: [...prev.powerUps, powerUp]
      }));
    }

    setTimeout(spawnPowerUp, 15000 + Math.random() * 10000);
  }, [gameState.status]);

  // Collision detection yang akurat dan efek visual
  const checkCollisions = useCallback(() => {
    // Player-obstacle collisions
    obstacles.forEach(obstacle => {
      if (obstacle.passed) return;

      const playerRect = {
        x: dino.x,
        y: dino.y,
        width: dino.width,
        height: dino.height
      };

      const obstacleRect = {
        x: obstacle.x,
        y: obstacle.y,
        width: obstacle.width,
        height: obstacle.height
      };

      // Check collision
      if (playerRect.x < obstacleRect.x + obstacleRect.width &&
          playerRect.x + playerRect.width > obstacleRect.x &&
          playerRect.y < obstacleRect.y + obstacleRect.height &&
          playerRect.y + playerRect.height > obstacleRect.y) {
        
        // Handle collision based on obstacle type
        if (obstacle.type === 'rock' && dino.isDucking) {
          // Player successfully ducked under rock
          obstacle.passed = true;
          setGameState(prev => ({ ...prev, score: prev.score + obstacle.points }));
          createParticles(obstacle.x, obstacle.y, '#FFD700', 15);
          playSound('success');
        } else {
          // Player hit obstacle
          if (!gameState.rainbowMode) {
            setGameState(prev => ({ ...prev, lives: prev.lives - 1 }));
            createParticles(dino.x + dino.width/2, dino.y + dino.height/2, '#FF0000', 20);
            playSound('hit');
            
            if (prev.lives <= 1) {
              setGameState(prev => ({ ...prev, status: 'gameOver' }));
              playSound('gameOver');
            }
          }
        }
      }

      // Check if passed obstacle
      if (obstacle.x + obstacle.width < dino.x && !obstacle.passed) {
        obstacle.passed = true;
        setGameState(prev => ({ 
          ...prev, 
          score: prev.score + obstacle.points,
          combo: prev.combo + 1
        }));
      }
    });

    // Player-powerup collisions
    gameState.powerUps.forEach(powerUp => {
      const distance = Math.sqrt(
        Math.pow(dino.x + dino.width/2 - (powerUp.x + powerUp.width/2), 2) +
        Math.pow(dino.y + dino.height/2 - (powerUp.y + powerUp.height/2), 2)
      );

      if (distance < 30) {
        // Activate power-up
        activatePowerUp(powerUp);
        createParticles(powerUp.x, powerUp.y, powerUp.color, 20);
        playSound('powerUp');
      }
    });
  }, [obstacles, dino, gameState.rainbowMode, gameState.powerUps]);

  // Activate power-up dengan efek visual
  const activatePowerUp = (powerUp) => {
    setGameState(prev => ({
      ...prev,
      powerUps: prev.powerUps.filter(p => p.id !== powerUp.id)
    }));

    switch(powerUp.effect) {
      case 'rainbow-mode':
        setGameState(prev => ({ 
          ...prev, 
          rainbowMode: true, 
          rainbowTimer: 300 
        }));
        break;
      case 'invincible':
        // Shield effect
        break;
      case 'double-speed':
        // Speed boost
        break;
    }
  };

  // Game loop utama dengan animasi smooth
  const gameLoop = useCallback(() => {
    if (gameState.status !== 'playing') return;

    // Update dino physics
    setDino(prev => {
      let newY = prev.y + prev.velocityY;
      let newVelocityY = prev.velocityY + 0.6; // Gravity
      
      // Ground collision
      if (newY >= ground.y - prev.height) {
        newY = ground.y - prev.height;
        newVelocityY = 0;
        
        return {
          ...prev,
          y: newY,
          velocityY: newVelocityY,
          isJumping: false
        };
      }

      // Rainbow trail
      if (gameState.rainbowMode) {
        createRainbowTrail(prev.x, prev.y);
      }

      return {
        ...prev,
        y: newY,
        velocityY: newVelocityY
      };
    });

    // Update obstacles
    setObstacles(prev => prev.map(obstacle => ({
      ...obstacle,
      x: obstacle.x - obstacle.speed
    })).filter(obstacle => obstacle.x > -100));

    // Update power-ups
    setGameState(prev => ({
      ...prev,
      powerUps: prev.powerUps.map(powerUp => ({
        ...powerUp,
        x: powerUp.x - powerUp.speed
      })).filter(powerUp => powerUp.x > -50)
    }));

    // Update clouds
    setClouds(prev => prev.map(cloud => ({
      ...cloud,
      x: cloud.x - cloud.speed
    })).map(cloud => 
      cloud.x < -100 ? { ...cloud, x: 850 } : cloud
    ));

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

    // Update rainbow timer
    if (gameState.rainbowMode) {
      setGameState(prev => ({
        ...prev,
        rainbowTimer: prev.rainbowTimer - 1
      }));
      
      if (gameState.rainbowTimer <= 0) {
        setGameState(prev => ({ ...prev, rainbowMode: false }));
      }
    }

    // Check collisions
    checkCollisions();

    // Level progression
    if (gameState.score > gameState.level * 200) {
      setGameState(prev => ({ ...prev, level: prev.level + 1 }));
      playSound('levelUp');
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.status, gameState.rainbowMode, gameState.rainbowTimer, checkCollisions, ground.y]);

  // Sound system
  const playSound = (soundType) => {
    if (!audioRef.current) return;
    
    const sounds = {
      jump: '/sounds/jump.mp3',
      hit: '/sounds/hit.mp3',
      powerUp: '/sounds/power-up.mp3',
      levelUp: '/sounds/level-up.mp3',
      gameOver: '/sounds/game-over.mp3',
      success: '/sounds/success.mp3'
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
    spawnObstacle();
    spawnPowerUp();
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
      rainbowMode: false,
      rainbowTimer: 0,
      powerUps: [],
      particles: []
    });
    
    setDino({
      x: 100,
      y: 300,
      width: 50,
      height: 50,
      velocityY: 0,
      isJumping: false,
      isDucking: false,
      color: DINO_THEMES[selectedDino].colors[0],
      rainbowTrail: []
    });
    
    setObstacles([]);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case ' ':
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          if (gameState.status === 'menu') startGame();
          else if (gameState.status === 'playing') jump();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (gameState.status === 'playing') duck(true);
          break;
        case 'p':
        case 'P':
          if (gameState.status === 'playing') pauseGame();
          else if (gameState.status === 'paused') resumeGame();
          break;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        duck(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.status, jump, duck, pauseGame, resumeGame]);

  // Touch controls untuk mobile dengan gesture yang smooth
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const startY = touch.clientY;

    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const endY = touch.clientY;
      const deltaY = endY - startY;

      if (Math.abs(deltaY) > 30) {
        if (deltaY < -30) {
          // Swipe up - jump
          jump();
        } else if (deltaY > 30) {
          // Swipe down - duck
          duck(true);
          setTimeout(() => duck(false), 500);
        }
      }

      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchend', handleTouchEnd);
  };

  // Render game canvas
  const renderCanvas = () => {
    const canvas = document.getElementById('dino-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas dengan gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98D8E8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 400);

    // Draw clouds dengan animasi
    clouds.forEach(cloud => {
      ctx.save();
      ctx.globalAlpha = cloud.opacity;
      ctx.font = `${cloud.size}px Arial`;
      ctx.fillText(cloud.emoji, cloud.x, cloud.y);
      ctx.restore();
    });

    // Draw ground dengan animasi
    ctx.fillStyle = '#228B22';
    ground.segments.forEach(segment => {
      ctx.fillRect(segment.x, ground.y, 40, segment.height);
    });

    // Draw dino dengan animasi dan efek visual
    const theme = DINO_THEMES[selectedDino];
    
    // Rainbow trail
    if (gameState.rainbowMode) {
      gameState.particles.filter(p => p.type === 'rainbow-trail').forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life / 25;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // Dino body dengan warna tema
    ctx.save();
    
    // Shadow effect
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(dino.x + 5, ground.y - 5, dino.width, 10);
    
    // Dino body
    if (dino.isDucking) {
      // Ducking position
      ctx.fillStyle = theme.colors[0];
      ctx.fillRect(dino.x, dino.y + 25, dino.width, 25);
      
      // Head
      ctx.fillStyle = theme.colors[1] || theme.colors[0];
      ctx.beginPath();
      ctx.arc(dino.x + dino.width/2, dino.y + 37, 12, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal position
      ctx.fillStyle = theme.colors[0];
      ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
      
      // Head
      ctx.fillStyle = theme.colors[1] || theme.colors[0];
      ctx.beginPath();
      ctx.arc(dino.x + dino.width/2, dino.y + 15, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Eyes
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(dino.x + dino.width/2 - 8, dino.y + 12, 3, 0, Math.PI * 2);
      ctx.arc(dino.x + dino.width/2 + 8, dino.y + 12, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(dino.x + dino.width/2 - 8, dino.y + 12, 1, 0, Math.PI * 2);
      ctx.arc(dino.x + dino.width/2 + 8, dino.y + 12, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Legs animation
    if (dino.isJumping) {
      // Jumping legs
      ctx.strokeStyle = theme.colors[2] || theme.colors[0];
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(dino.x + 15, dino.y + dino.height);
      ctx.lineTo(dino.x + 10, dino.y + dino.height + 10);
      ctx.moveTo(dino.x + 35, dino.y + dino.height);
      ctx.lineTo(dino.x + 40, dino.y + dino.height + 10);
      ctx.stroke();
    }
    
    ctx.restore();

    // Draw obstacles dengan animasi
    obstacles.forEach(obstacle => {
      ctx.save();
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(obstacle.x + 3, obstacle.y + obstacle.height - 3, obstacle.width, 6);
      
      // Main obstacle
      ctx.fillStyle = obstacle.color;
      if (obstacle.type === 'cactus') {
        // Draw cactus shape
        ctx.fillRect(obstacle.x + 15, obstacle.y + 20, 10, 40);
        ctx.fillRect(obstacle.x + 5, obstacle.y + 30, 10, 20);
        ctx.fillRect(obstacle.x + 25, obstacle.y + 25, 10, 25);
      } else if (obstacle.type === 'bird') {
        // Draw bird shape
        ctx.beginPath();
        ctx.ellipse(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2, 
                   obstacle.width/2, obstacle.height/2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      }
      
      // Emoji overlay
      ctx.font = `${obstacle.height * 0.8}px Arial`;
      ctx.fillText(obstacle.emoji, obstacle.x + obstacle.width/4, obstacle.y + obstacle.height/2);
      
      ctx.restore();
    });

    // Draw power-ups dengan animasi
    gameState.powerUps.forEach(powerUp => {
      ctx.save();
      
      // Glow effect
      ctx.shadowColor = powerUp.color;
      ctx.shadowBlur = 20;
      
      // Power-up shape
      ctx.fillStyle = powerUp.color;
      ctx.beginPath();
      ctx.arc(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, powerUp.width/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Icon
      ctx.font = `${powerUp.height * 0.6}px Arial`;
      ctx.fillText(powerUp.name.split(' ')[0], powerUp.x + powerUp.width/4, powerUp.y + powerUp.height/2);
      
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
  };

  // Main UI dengan animasi lucu dan tema rainbow
  return (
    <div className="dino-runner-container">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="sky-gradient"></div>
        {clouds.map((cloud, i) => (
          <motion.div
            key={i}
            className="cloud"
            style={{
              left: cloud.x,
              top: cloud.y,
              fontSize: cloud.size,
              opacity: cloud.opacity
            }}
            animate={{
              x: [0, -50, 0],
              y: [0, 10, 0]
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {cloud.emoji}
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
              color: DINO_THEMES[selectedDino].colors
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌈 Rainbow Dino Dash
          </motion.h1>
          
          <div className="dino-selection">
            <span>Pilih Dino: </span>
            <select 
              value={selectedDino} 
              onChange={(e) => setSelectedDino(e.target.value)}
              className="dino-select"
            >
              {Object.entries(DINO_THEMES).map(([key, theme]) => (
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
              style={{ color: DINO_THEMES[selectedDino].colors[0] }}
            >
              💎 {gameState.score.toLocaleString()}
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
                  background: `linear-gradient(90deg, ${DINO_THEMES[selectedDino].colors.join(', ')})`
                }}
              />
            </div>
          </div>

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
                ❤️
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Game Area */}
      <div className="game-area">
        <canvas
          id="dino-canvas"
          ref={canvasRef}
          width={800}
          height={400}
          className="game-canvas"
          onTouchStart={handleTouchStart}
        />

        {/* Player Health Bar */}
        <div className="player-health-bar">
          <div className="health-label">Dino Health</div>
          <div className="health-bar-container">
            <motion.div 
              className="health-bar"
              initial={{ width: '100%' }}
              animate={{ width: `${Math.max(0, (gameState.lives / 3) * 100)}%` }}
              transition={{ duration: 0.3 }}
              style={{ 
                background: `linear-gradient(90deg, ${DINO_THEMES[selectedDino].colors.join(', ')})`
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
                🌈 RAINBOW MODE AKTIF! 🌈
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
              className="menu-dino"
            >
              🦕
            </motion.div>
            
            <h2>Selamat Datang di Rainbow Dino Dash!</h2>
            <p>Lompat, ngek, dan kumpulkan rainbow bersama dino! 🌈</p>
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={startGame}
              className="start-button"
              style={{ 
                background: `linear-gradient(45deg, ${DINO_THEMES[selectedDino].colors.join(', ')})`
              }}
            >
              <Play className="icon" />
              Mulai Petualangan!
            </motion.button>

            <div className="menu-instructions">
              <p><strong>🎮 Kontrol:</strong></p>
              <p>• SPACE / ↑ untuk lompat</p>
              <p>• ↓ untuk ngek (duck)</p>
              <p>• Kumpulkan power-up rainbow!</p>
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

            <div className="touch-controls">
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: '#4ECDC4' }}
                whileTap={{ scale: 0.9 }}
                onClick={jump}
                className="jump-btn"
              >
                <Zap className="icon" />
                LOMPAT!
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: '#FF6B6B' }}
                whileTap={{ scale: 0.9 }}
                onMouseDown={() => duck(true)}
                onMouseUp={() => duck(false)}
                onTouchStart={() => duck(true)}
                onTouchEnd={() => duck(false)}
                className="duck-btn"
              >
                ↓ NGEK
              </motion.button>
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
            <p>Dino sedang istirahat... 🦕💤</p>
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
                rotate: [0, -15, 15, -15, 0],
                y: [0, -30, 0]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="sad-dino"
            >
              🦕💥
            </motion.div>
            
            <h3>Oh Tidak! Dino Tabrakan!</h3>
            
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
                <Zap className="icon" />
                <span>Level: {gameState.level}</span>
              </motion.div>
              
              <motion.div 
                className="stat-item"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Heart className="icon" />
                <span>Combo: {gameState.combo}</span>
              </motion.div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={restartGame}
              className="restart-button"
              style={{ 
                background: `linear-gradient(45deg, ${DINO_THEMES[selectedDino].colors.join(', ')})`
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

export default DinoRunner;

