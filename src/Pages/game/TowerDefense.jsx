// src/Pages/game/TowerDefense.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Trophy, Zap, Shield, Target, Castle } from 'lucide-react';
import './styles/TowerDefense.css';

const TowerDefense = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioRef = useRef(null);
  
  // Game state dengan tema rainbow dan tower defense
  const [gameState, setGameState] = useState({
    status: 'menu', // menu, playing, paused, gameOver
    score: 0,
    level: 1,
    lives: 20,
    money: 100,
    wave: 1,
    enemies: [],
    towers: [],
    projectiles: [],
    particles: [],
    powerUps: [],
    rainbowMode: false,
    rainbowTimer: 0
  });

  const [selectedTower, setSelectedTower] = useState('basic');
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [difficulty, setDifficulty] = useState('normal');

  // Grid system untuk tower defense
  const GRID_SIZE = 15;
  const CELL_SIZE = 40;
  const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE;
  const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE;

  // Tower themes dengan animasi dan efek visual
  const TOWER_THEMES = {
    rainbow: {
      name: '🌈 Rainbow Towers',
      colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
      special: 'rainbow-beam'
    },
    neon: {
      name: '⚡ Neon Towers',
      colors: ['#00FFFF', '#FF00FF', '#FFFF00'],
      special: 'laser-beam'
    },
    galaxy: {
      name: '🌌 Galaxy Towers',
      colors: ['#9D4EDD', '#C77DFF', '#E0AAFF'],
      special: 'plasma-beam'
    },
    golden: {
      name: '⭐ Golden Towers',
      colors: ['#FFD700', '#FFA500', '#FFFF00'],
      special: 'golden-beam'
    }
  };

  // Tower types dengan animasi dan efek khusus
  const TOWER_TYPES = {
    basic: {
      name: '🏹 Basic Tower',
      cost: 50,
      damage: 25,
      range: 120,
      fireRate: 800,
      color: '#FF6B6B',
      projectileColor: '#FF0000',
      effect: 'normal'
    },
    rapid: {
      name: '⚡ Rapid Tower',
      cost: 75,
      damage: 15,
      range: 100,
      fireRate: 300,
      color: '#4ECDC4',
      projectileColor: '#00FFFF',
      effect: 'fast-shoot'
    },
    heavy: {
      name: '💥 Heavy Tower',
      cost: 100,
      damage: 60,
      range: 140,
      fireRate: 1500,
      color: '#9D4EDD',
      projectileColor: '#9400D3',
      effect: 'slow-but-powerful'
    },
    rainbow: {
      name: '🌈 Rainbow Tower',
      cost: 150,
      damage: 40,
      range: 160,
      fireRate: 500,
      color: 'rainbow',
      projectileColor: 'rainbow',
      effect: 'rainbow-beam'
    },
    ice: {
      name: '❄️ Ice Tower',
      cost: 80,
      damage: 20,
      range: 110,
      fireRate: 600,
      color: '#00BFFF',
      projectileColor: '#87CEEB',
      effect: 'slow-enemies'
    }
  };

  // Enemy types dengan animasi dan efek
  const ENEMY_TYPES = {
    basic: {
      name: '👾 Basic Enemy',
      health: 100,
      speed: 2,
      reward: 10,
      color: '#FF6B6B',
      size: 20,
      effect: 'none'
    },
    fast: {
      name: '🏃 Fast Enemy',
      health: 60,
      speed: 4,
      reward: 15,
      color: '#4ECDC4',
      size: 18,
      effect: 'speed-boost'
    },
    tank: {
      name: '🛡️ Tank Enemy',
      health: 300,
      speed: 1,
      reward: 30,
      color: '#9D4EDD',
      size: 30,
      effect: 'high-health'
    },
    flying: {
      name: '🦅 Flying Enemy',
      health: 80,
      speed: 3,
      reward: 20,
      color: '#FFD700',
      size: 22,
      effect: 'air-unit'
    },
    boss: {
      name: '👑 Boss Enemy',
      health: 1000,
      speed: 1.5,
      reward: 100,
      color: '#FF0000',
      size: 40,
      effect: 'boss-unit'
    }
  };

  // Power-ups untuk tower defense
  const POWER_UPS = {
    boost: {
      name: '⚡ Damage Boost',
      duration: 10000,
      effect: 'double-damage',
      color: '#FFD700'
    },
    speed: {
      name: '🚀 Speed Boost',
      duration: 8000,
      effect: 'double-fire-rate',
      color: '#FF00FF'
    },
    range: {
      name: '🎯 Range Boost',
      duration: 12000,
      effect: 'double-range',
      color: '#00FFFF'
    },
    rainbow: {
      name: '🌈 Rainbow Storm',
      duration: 15000,
      effect: 'rainbow-mode',
      color: '#FF69B4'
    }
  };

  // Path finding untuk enemy movement
  const findPath = (start, end) => {
    // Simple path: from start to end with some curves
    const path = [];
    const steps = 20;
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const x = start.x + (end.x - start.x) * progress;
      const y = start.y + (end.y - start.y) * progress + Math.sin(progress * Math.PI * 2) * 2;
      
      path.push({ x, y });
    }
    
    return path;
  };

  // Initialize game dengan animasi dan efek visual
  useEffect(() => {
    initializeGrid();
    initializeParticles();
    
    // Background music
    audioRef.current = new Audio('/sounds/tower-defense-music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
  }, []);

  // Initialize grid dengan path
  const initializeGrid = () => {
    // Create a simple path from left to right with some curves
    const path = findPath(
      { x: 0, y: Math.floor(GRID_SIZE / 2) },
      { x: GRID_SIZE - 1, y: Math.floor(GRID_SIZE / 2) }
    );
    
    // Mark path cells
    const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    path.forEach(point => {
      const gridX = Math.floor(point.x);
      const gridY = Math.floor(point.y);
      if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
        grid[gridY][gridX] = 1; // Path
      }
    });
    
    return grid;
  };

  // Particle system untuk efek visual
  const createParticles = (x, y, color, count = 10) => {
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        id: Date.now() + i,
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
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

  // Tower placement dengan animasi dan efek visual
  const placeTower = useCallback((gridX, gridY) => {
    if (gameState.status !== 'playing') return;
    if (gameState.money < TOWER_TYPES[selectedTower].cost) return;

    // Check if position is valid (not on path)
    const grid = initializeGrid();
    if (grid[gridY][gridX] === 1) return; // Path cell

    // Check if tower already exists
    const existingTower = gameState.towers.find(tower => 
      tower.gridX === gridX && tower.gridY === gridY
    );
    if (existingTower) return;

    const newTower = {
      id: Date.now() + Math.random(),
      x: gridX * CELL_SIZE + CELL_SIZE / 2,
      y: gridY * CELL_SIZE + CELL_SIZE / 2,
      gridX,
      gridY,
      type: selectedTower,
      ...TOWER_TYPES[selectedTower],
      lastFire: 0,
      target: null,
      level: 1
    };

    setGameState(prev => ({
      ...prev,
      towers: [...prev.towers, newTower],
      money: prev.money - TOWER_TYPES[selectedTower].cost
    }));

    // Create placement particles
    createParticles(newTower.x, newTower.y, TOWER_TYPES[selectedTower].color, 15);
    playSound('placeTower');
  }, [gameState.status, gameState.money, gameState.towers, selectedTower]);

  // Enemy spawning dengan sistem level yang balanced
  const spawnEnemy = useCallback(() => {
    if (gameState.status !== 'playing') return;

    const types = Object.keys(ENEMY_TYPES);
    const weights = [0.4, 0.25, 0.2, 0.1, 0.05]; // Normal distribution
    const randomType = weightedRandom(types, weights);
    
    const enemyType = ENEMY_TYPES[randomType];
    const path = findPath(
      { x: -1, y: Math.floor(GRID_SIZE / 2) },
      { x: GRID_SIZE, y: Math.floor(GRID_SIZE / 2) }
    );
    
    const newEnemy = {
      id: Date.now() + Math.random(),
      x: -CELL_SIZE,
      y: path[0].y * CELL_SIZE + CELL_SIZE / 2,
      pathIndex: 0,
      path: path,
      health: enemyType.health + (gameState.level * 10),
      maxHealth: enemyType.health + (gameState.level * 10),
      speed: enemyType.speed + (gameState.level * 0.2),
      ...enemyType,
      slowed: false,
      slowedTimer: 0
    };

    setGameState(prev => ({
      ...prev,
      enemies: [...prev.enemies, newEnemy]
    }));

    // Schedule next spawn
    const spawnDelay = Math.max(500, 1000 - (gameState.level * 50));
    setTimeout(spawnEnemy, spawnDelay + Math.random() * 500);
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

  // Tower shooting system dengan animasi dan efek visual
  const updateTowers = useCallback(() => {
    if (gameState.status !== 'playing') return;

    const currentTime = Date.now();

    gameState.towers.forEach(tower => {
      // Find target
      tower.target = null;
      let closestDistance = tower.range;

      gameState.enemies.forEach(enemy => {
        const distance = Math.sqrt(
          Math.pow(enemy.x - tower.x, 2) + 
          Math.pow(enemy.y - tower.y, 2)
        );

        if (distance <= tower.range && distance < closestDistance) {
          closestDistance = distance;
          tower.target = enemy;
        }
      });

      // Shoot if has target and cooldown is ready
      if (tower.target && currentTime - tower.lastFire >= tower.fireRate) {
        const projectile = {
          id: Date.now() + Math.random(),
          x: tower.x,
          y: tower.y,
          targetX: tower.target.x,
          targetY: tower.target.y,
          target: tower.target,
          speed: 10,
          damage: tower.damage,
          color: tower.projectileColor,
          type: tower.type
        };

        setGameState(prev => ({
          ...prev,
          projectiles: [...prev.projectiles, projectile]
        }));

        tower.lastFire = currentTime;
        
        // Create shooting particles
        createParticles(tower.x, tower.y, tower.color, 8);
        playSound('shoot');
      }
    });
  }, [gameState.status, gameState.towers, gameState.enemies]);

  // Projectile movement dan collision detection
  const updateProjectiles = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      projectiles: prev.projectiles.filter(projectile => {
        const dx = projectile.targetX - projectile.x;
        const dy = projectile.targetY - projectile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
          // Hit target
          if (projectile.target && projectile.target.health > 0) {
            projectile.target.health -= projectile.damage;
            
            // Create hit particles
            createParticles(projectile.target.x, projectile.target.y, projectile.color, 10);
            
            // Apply special effects
            if (projectile.type === 'ice') {
              projectile.target.slowed = true;
              projectile.target.slowedTimer = 3000;
            }
            
            if (projectile.target.health <= 0) {
              // Enemy defeated
              setGameState(current => ({
                ...current,
                score: current.score + projectile.target.reward,
                money: current.money + Math.floor(projectile.target.reward / 2),
                combo: current.combo + 1
              }));
              
              playSound('explosion');
            }
          }
          return false;
        }

        // Move projectile
        projectile.x += (dx / distance) * projectile.speed;
        projectile.y += (dy / distance) * projectile.speed;
        
        return true;
      })
    }));
  }, []);

  // Enemy movement dengan pathfinding
  const updateEnemies = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      enemies: prev.enemies.filter(enemy => {
        if (enemy.health <= 0) return false;

        // Move along path
        if (enemy.pathIndex < enemy.path.length - 1) {
          const target = enemy.path[enemy.pathIndex + 1];
          const targetX = target.x * CELL_SIZE + CELL_SIZE / 2;
          const targetY = target.y * CELL_SIZE + CELL_SIZE / 2;

          const dx = targetX - enemy.x;
          const dy = targetY - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 5) {
            enemy.pathIndex++;
          } else {
            const speed = enemy.slowed ? enemy.speed * 0.5 : enemy.speed;
            enemy.x += (dx / distance) * speed;
            enemy.y += (dy / distance) * speed;
          }
        } else {
          // Enemy reached the end
          setGameState(current => ({ 
            ...current, 
            lives: current.lives - 1 
          }));
          return false;
        }

        // Update slow effect
        if (enemy.slowedTimer > 0) {
          enemy.slowedTimer -= 16; // Assuming 60fps
          if (enemy.slowedTimer <= 0) {
            enemy.slowed = false;
          }
        }

        return true;
      })
    }));
  }, []);

  // Wave system
  const startWave = useCallback(() => {
    if (gameState.status !== 'playing') return;

    // Increase wave number
    setGameState(prev => ({ ...prev, wave: prev.wave + 1 }));
    
    // Spawn enemies for this wave
    const enemyCount = 5 + gameState.wave * 2;
    for (let i = 0; i < enemyCount; i++) {
      setTimeout(spawnEnemy, i * 500);
    }
    
    playSound('waveStart');
  }, [gameState.status, gameState.wave, spawnEnemy]);

  // Game loop utama
  const gameLoop = useCallback(() => {
    if (gameState.status !== 'playing') return;

    updateTowers();
    updateProjectiles();
    updateEnemies();

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

    // Check wave completion
    if (gameState.enemies.length === 0 && gameState.status === 'playing') {
      // Wave complete - start next wave after delay
      setTimeout(startWave, 3000);
    }

    // Check game over
    if (gameState.lives <= 0) {
      setGameState(prev => ({ ...prev, status: 'gameOver' }));
      playSound('gameOver');
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.status, gameState.enemies.length, gameState.lives, updateTowers, updateProjectiles, updateEnemies, startWave]);

  // Sound system
  const playSound = (soundType) => {
    const sounds = {
      placeTower: '/sounds/place-tower.mp3',
      shoot: '/sounds/tower-shoot.mp3',
      explosion: '/sounds/enemy-explode.mp3',
      waveStart: '/sounds/wave-start.mp3',
      gameOver: '/sounds/game-over.mp3'
    };

    const audio = new Audio(sounds[soundType]);
    audio.volume = volume;
    audio.play().catch(() => {});
  };

  // Game control functions
  const startGame = () => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
    audioRef.current?.play();
    gameLoop();
    startWave();
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
      lives: 20,
      money: 100,
      wave: 1,
      enemies: [],
      towers: [],
      projectiles: [],
      particles: [],
      powerUps: [],
      rainbowMode: false,
      rainbowTimer: 0
    });
  };

  // Canvas click handler
  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const gridX = Math.floor(x / CELL_SIZE);
    const gridY = Math.floor(y / CELL_SIZE);
    
    placeTower(gridX, gridY);
  };

  // Main UI dengan animasi lucu dan tema rainbow
  return (
    <div className="tower-defense-container">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="grid-pattern"></div>
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="floating-tower"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 15}px`
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {['🏰', '🗼', '🏗️', '🏘️'][i % 4]}
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
              color: TOWER_THEMES[selectedTower].colors
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🏰 Rainbow Tower Defense
          </motion.h1>
          
          <div className="tower-selection">
            <span>Pilih Tower: </span>
            <select 
              value={selectedTower} 
              onChange={(e) => setSelectedTower(e.target.value)}
              className="tower-select"
            >
              {Object.entries(TOWER_TYPES).map(([key, tower]) => (
                <option key={key} value={key}>{tower.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="header-right">
          <div className="resources-display">
            <motion.div 
              key={gameState.money}
              initial={{ scale: 1.5, rotate: 360 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="money-display"
              style={{ color: TOWER_THEMES[selectedTower].colors[0] }}
            >
              💰 {gameState.money}
            </motion.div>
            
            <div className="wave-display">
              <span>Gelombang {gameState.wave}</span>
              <div className="wave-bar">
                <motion.div 
                  className="wave-progress"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (gameState.enemies.length / (5 + gameState.wave * 2)) * 100)}%` }}
                  transition={{ duration: 0.5 }}
                  style={{ 
                    background: `linear-gradient(90deg, ${TOWER_THEMES[selectedTower].colors.join(', ')})`
                  }}
                />
              </div>
            </div>

            <div className="lives-display">
              {[...Array(Math.min(5, gameState.lives))].map((_, i) => (
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
              {gameState.lives > 5 && (
                <span className="extra-lives">+{gameState.lives - 5}</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tower Shop */}
      <motion.div 
        className="tower-shop"
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <h3>🏪 Tower Shop</h3>
        <div className="tower-list">
          {Object.entries(TOWER_TYPES).map(([key, tower]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTower(key)}
              className={`tower-shop-item ${selectedTower === key ? 'selected' : ''}`}
              disabled={gameState.money < tower.cost}
            >
              <div className="tower-preview" style={{ backgroundColor: tower.color }}></div>
              <div className="tower-info">
                <div className="tower-name">{tower.name}</div>
                <div className="tower-cost">💰 {tower.cost}</div>
                <div className="tower-stats">
                  <span>Damage: {tower.damage}</span>
                  <span>Range: {tower.range}</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main Game Area */}
      <div className="game-area">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleCanvasClick}
          className="game-canvas"
        />

        {/* Grid overlay */}
        <div className="grid-overlay">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            const grid = initializeGrid();
            const isPath = grid[y][x] === 1;
            const hasTower = gameState.towers.some(tower => 
              tower.gridX === x && tower.gridY === y
            );

            return (
              <div
                key={index}
                className={`grid-cell ${isPath ? 'path' : ''} ${hasTower ? 'occupied' : ''}`}
                style={{
                  left: x * CELL_SIZE,
                  top: y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE
                }}
                onClick={() => placeTower(x, y)}
              />
            );
          })}
        </div>

        {/* Player Stats */}
        <div className="player-stats">
          <div className="score-display">
            <motion.span 
              key={gameState.score}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="score-number"
            >
              ⭐ {gameState.score.toLocaleString()}
            </motion.span>
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

        {/* Wave Progress */}
        <div className="wave-progress">
          <div className="wave-info">
            <span>Wave {gameState.wave}</span>
            <span>{gameState.enemies.length} enemies remaining</span>
          </div>
          <div className="wave-bar">
            <motion.div 
              className="wave-progress-bar"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, 100 - (gameState.enemies.length / (5 + gameState.wave * 2)) * 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
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
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="menu-castle"
            >
              🏰
            </motion.div>
            
            <h2>Selamat Datang di Rainbow Tower Defense!</h2>
            <p>Bangun tower, pertahankan basis, dan kumpulkan rainbow! 🌈</p>
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={startGame}
              className="start-button"
              style={{ 
                background: `linear-gradient(45deg, ${TOWER_THEMES[selectedTower].colors.join(', ')})`
              }}
            >
              <Play className="icon" />
              Mulai Pertahanan!
            </motion.button>

            <div className="menu-instructions">
              <p><strong>🎮 Kontrol:</strong></p>
              <p>• Klik di grid untuk menempatkan tower</p>
              <p>• Jangan letakkan tower di jalur musuh</p>
              <p>• Kumpulkan uang untuk tower yang lebih kuat!</p>
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

            <div className="wave-controls">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: '#4ECDC4' }}
                whileTap={{ scale: 0.95 }}
                onClick={startWave}
                disabled={gameState.enemies.length > 0}
                className="wave-btn"
              >
                <Zap className="icon" />
                Mulai Wave!
              </motion.button>
              
              <div className="game-instructions">
                <p>🎯 Klik di grid untuk menempatkan {TOWER_TYPES[selectedTower].name}</p>
                <p>💰 Biaya: {TOWER_TYPES[selectedTower].cost}</p>
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
            <h3>Pertahanan Dijeda</h3>
            <p>Tower sedang istirahat... 🏰💤</p>
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
              className="destroyed-castle"
            >
              🏰💥
            </motion.div>
            
            <h3>Basis Telah Jatuh!</h3>
            
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
                <Target className="icon" />
                <span>Wave: {gameState.wave}</span>
              </motion.div>
              
              <motion.div 
                className="stat-item"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Castle className="icon" />
                <span>Towers Built: {gameState.towers.length}</span>
              </motion.div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={restartGame}
              className="restart-button"
              style={{ 
                background: `linear-gradient(45deg, ${TOWER_THEMES[selectedTower].colors.join(', ')})`
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

export default TowerDefense;

