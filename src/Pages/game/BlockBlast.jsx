// src/Pages/game/BlockBlast.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Trophy, Zap, Star, Sparkles, Grid3x3, Edit3 } from 'lucide-react';
import './styles/BlockBlast.css';

const BlockBlast = () => {
  const GRID_SIZE = 10;
  const BLOCK_SIZE = 35;

  // Game state dengan tema rainbow dan puzzle mechanics
  const [gameState, setGameState] = useState({
    status: 'menu', // menu, playing, paused, gameOver
    score: 0,
    level: 1,
    combo: 0,
    grid: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0)),
    currentBlocks: [],
    nextBlocks: [],
    particles: [],
    rainbowMode: false,
    rainbowTimer: 0,
    powerUps: [],
    playerName: '',
    gameStarted: false
  });

  const [selectedBlock, setSelectedBlock] = useState(null);
  const [showNameInput, setShowNameInput] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [difficulty, setDifficulty] = useState('normal');

  // Block themes dengan animasi dan efek visual
  const BLOCK_THEMES = {
    rainbow: {
      name: '🌈 Rainbow Blocks',
      colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
      special: 'rainbow-match'
    },
    neon: {
      name: '⚡ Neon Blocks',
      colors: ['#00FFFF', '#FF00FF', '#FFFF00'],
      special: 'glow-match'
    },
    galaxy: {
      name: '🌌 Galaxy Blocks',
      colors: ['#9D4EDD', '#C77DFF', '#E0AAFF'],
      special: 'star-match'
    },
    pastel: {
      name: '🎨 Pastel Blocks',
      colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'],
      special: 'soft-match'
    }
  };

  // Block types dengan animasi dan efek
  const BLOCK_TYPES = {
    normal: { 
      size: 1, 
      color: '#FF6B6B', 
      emoji: '⬜',
      points: 10,
      effect: 'none'
    },
    double: { 
      size: 2, 
      color: '#4ECDC4', 
      emoji: '⬛',
      points: 25,
      effect: 'double-points'
    },
    triple: { 
      size: 3, 
      color: '#9D4EDD', 
      emoji: '🔲',
      points: 50,
      effect: 'triple-points'
    },
    rainbow: { 
      size: 1, 
      color: 'rainbow', 
      emoji: '🌈',
      points: 100,
      effect: 'rainbow-match'
    },
    bomb: { 
      size: 2, 
      color: '#FF4500', 
      emoji: '💣',
      points: 75,
      effect: 'explode-nearby'
    },
    star: { 
      size: 1, 
      color: '#FFD700', 
      emoji: '⭐',
      points: 200,
      effect: 'clear-row-column'
    }
  };

  // Power-ups untuk block blast
  const POWER_UPS = {
    hammer: {
      name: '🔨 Hammer',
      effect: 'break-single',
      color: '#FF6B6B'
    },
    rainbow: {
      name: '🌈 Rainbow Blast',
      effect: 'clear-color',
      color: '#FF69B4'
    },
    bomb: {
      name: '💣 Super Bomb',
      effect: 'explode-area',
      color: '#FF4500'
    },
    shuffle: {
      name: '🔄 Shuffle',
      effect: 'shuffle-blocks',
      color: '#4ECDC4'
    }
  };

  // Block shapes untuk tetris-like mechanics
  const BLOCK_SHAPES = [
    // Single block
    [[1]],
    
    // L shapes
    [[1, 1], [1, 0]],
    [[1, 1], [0, 1]],
    [[1, 0], [1, 1]],
    [[0, 1], [1, 1]],
    
    // T shapes
    [[1, 1, 1], [0, 1, 0]],
    [[0, 1, 0], [1, 1, 1]],
    
    // I shapes
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]],
    
    // Square
    [[1, 1], [1, 1]],
    
    // Z shapes
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]]
  ];

  // Initialize game dengan animasi dan efek visual
  useEffect(() => {
    generateNewBlocks();
    initializeParticles();
  }, []);

  // Generate new blocks dengan animasi
  const generateNewBlocks = useCallback(() => {
    const blocks = [];
    for (let i = 0; i < 3; i++) {
      const shape = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
      const type = Math.random() < 0.1 ? 'rainbow' : 
                  Math.random() < 0.15 ? 'bomb' :
                  Math.random() < 0.2 ? 'star' :
                  Math.random() < 0.3 ? 'double' :
                  Math.random() < 0.4 ? 'triple' : 'normal';
      
      blocks.push({
        id: Date.now() + i,
        shape,
        type,
        color: BLOCK_TYPES[type].color,
        emoji: BLOCK_TYPES[type].emoji,
        x: 0,
        y: 0,
        rotation: 0
      });
    }
    
    setGameState(prev => ({
      ...prev,
      currentBlocks: blocks,
      nextBlocks: [] // Could implement next blocks preview
    }));
  }, []);

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
        type: 'block-effect'
      });
    }
    
    setGameState(prev => ({
      ...prev,
      particles: [...prev.particles, ...particles]
    }));
  };

  // Block placement dengan animasi smooth dan validasi
  const canPlaceBlock = (block, startX, startY) => {
    const grid = gameState.grid;
    
    for (let y = 0; y < block.shape.length; y++) {
      for (let x = 0; x < block.shape[y].length; x++) {
        if (block.shape[y][x]) {
          const gridX = startX + x;
          const gridY = startY + y;
          
          // Check boundaries
          if (gridX < 0 || gridX >= GRID_SIZE || gridY < 0 || gridY >= GRID_SIZE) {
            return false;
          }
          
          // Check if cell is occupied
          if (grid[gridY][gridX] !== 0) {
            return false;
          }
        }
      }
    }
    
    return true;
  };

  const placeBlock = (block, startX, startY) => {
    if (!canPlaceBlock(block, startX, startY)) return false;

    const newGrid = gameState.grid.map(row => [...row]);
    
    // Place block
    for (let y = 0; y < block.shape.length; y++) {
      for (let x = 0; x < block.shape[y].length; x++) {
        if (block.shape[y][x]) {
          newGrid[startY + y][startX + x] = block.type === 'rainbow' ? 
            Math.floor(Math.random() * 6) + 1 : 
            BLOCK_TYPES[block.type].color;
        }
      }
    }
    
    setGameState(prev => ({
      ...prev,
      grid: newGrid
    }));
    
    // Create placement particles
    createParticles(startX * BLOCK_SIZE + BLOCK_SIZE/2, startY * BLOCK_SIZE + BLOCK_SIZE/2, block.color, 10);
    
    return true;
  };

  // Line clearing dengan animasi dan efek spesial
  const checkForCompleteLines = useCallback(() => {
    const grid = gameState.grid;
    let linesCleared = 0;
    let blocksCleared = 0;
    const newGrid = grid.map(row => [...row]);
    
    // Check rows
    for (let y = 0; y < GRID_SIZE; y++) {
      if (newGrid[y].every(cell => cell !== 0)) {
        // Row is complete
        newGrid[y] = Array(GRID_SIZE).fill(0);
        linesCleared++;
        blocksCleared += GRID_SIZE;
        
        // Create particles for row clear
        for (let x = 0; x < GRID_SIZE; x++) {
          createParticles(x * BLOCK_SIZE + BLOCK_SIZE/2, y * BLOCK_SIZE + BLOCK_SIZE/2, '#FFD700', 5);
        }
      }
    }
    
    // Check columns
    for (let x = 0; x < GRID_SIZE; x++) {
      if (newGrid.every(row => row[x] !== 0)) {
        // Column is complete
        for (let y = 0; y < GRID_SIZE; y++) {
          newGrid[y][x] = 0;
        }
        linesCleared++;
        blocksCleared += GRID_SIZE;
        
        // Create particles for column clear
        for (let y = 0; y < GRID_SIZE; y++) {
          createParticles(x * BLOCK_SIZE + BLOCK_SIZE/2, y * BLOCK_SIZE + BLOCK_SIZE/2, '#FFD700', 5);
        }
      }
    }
    
    if (linesCleared > 0) {
      const points = blocksCleared * 10 * linesCleared;
      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        score: prev.score + points,
        combo: prev.combo + linesCleared
      }));
      
      playSound('lineClear');
    }
  }, [gameState.grid]);

  // Rotation system untuk blocks
  const rotateBlock = (block) => {
    const rotated = block.shape[0].map((_, index) =>
      block.shape.map(row => row[index]).reverse()
    );
    
    return {
      ...block,
      shape: rotated,
      rotation: (block.rotation + 90) % 360
    };
  };

  // Start game dengan name input
  const startGame = () => {
    if (!gameState.playerName.trim()) {
      setShowNameInput(true);
      return;
    }
    
    setGameState(prev => ({ ...prev, status: 'playing' }));
    playSound('start');
  };

  const submitName = (name) => {
    setGameState(prev => ({ ...prev, playerName: name }));
    setShowNameInput(false);
    setGameState(prev => ({ ...prev, status: 'playing' }));
    playSound('start');
  };

  // Game loop untuk particle updates
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    const interval = setInterval(() => {
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
    }, 50);

    return () => clearInterval(interval);
  }, [gameState.status]);

  // Sound system
  const playSound = (soundType) => {
    const sounds = {
      start: '/sounds/game-start.mp3',
      placeBlock: '/sounds/block-place.mp3',
      lineClear: '/sounds/line-clear.mp3',
      combo: '/sounds/combo.mp3',
      gameOver: '/sounds/game-over.mp3'
    };

    const audio = new Audio(sounds[soundType]);
    audio.volume = volume;
    audio.play().catch(() => {});
  };

  // Drag and drop system untuk blocks
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e, block) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDraggedBlock(block);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!draggedBlock) return;
    
    const gridElement = document.querySelector('.grid-container');
    if (!gridElement) return;
    
    const gridRect = gridElement.getBoundingClientRect();
    const x = e.clientX - gridRect.left - dragOffset.x;
    const y = e.clientY - gridRect.top - dragOffset.y;
    
    const gridX = Math.floor(x / BLOCK_SIZE);
    const gridY = Math.floor(y / BLOCK_SIZE);
    
    // Show preview
    setGameState(prev => ({ ...prev, previewPosition: { x: gridX, y: gridY } }));
  };

  const handleMouseUp = (e) => {
    if (!draggedBlock) return;
    
    const gridElement = document.querySelector('.grid-container');
    if (!gridElement) return;
    
    const gridRect = gridElement.getBoundingClientRect();
    const x = e.clientX - gridRect.left - dragOffset.x;
    const y = e.clientY - gridRect.top - dragOffset.y;
    
    const gridX = Math.floor(x / BLOCK_SIZE);
    const gridY = Math.floor(y / BLOCK_SIZE);
    
    if (placeBlock(draggedBlock, gridX, gridY)) {
      // Block placed successfully
      setGameState(prev => ({
        ...prev,
        currentBlocks: prev.currentBlocks.filter(b => b.id !== draggedBlock.id)
      }));
      
      // Generate new blocks if all used
      if (gameState.currentBlocks.length === 1) {
        setTimeout(generateNewBlocks, 500);
      }
    }
    
    setDraggedBlock(null);
    setDragOffset({ x: 0, y: 0 });
    setGameState(prev => ({ ...prev, previewPosition: null }));
  };

  // Main UI dengan animasi lucu dan tema rainbow
  return (
    <div className="block-blast-container">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="blocks-pattern"></div>
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="floating-block"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 25 + 20}px`
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
              y: [0, -20, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {['🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜'][i % 8]}
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
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #9D4EDD, #FFD700)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            🧩 Rainbow Block Blast
          </motion.h1>
          
          <div className="theme-selection">
            <span>Tema: </span>
            <select 
              onChange={(e) => {
                const theme = e.target.value;
                // Update block colors based on theme
              }}
              className="theme-select"
            >
              {Object.entries(BLOCK_THEMES).map(([key, theme]) => (
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
                animate={{ width: `${(gameState.score % 500)}%` }}
                transition={{ duration: 0.5 }}
                style={{ 
                  background: 'linear-gradient(90deg, #FF6B6B, #4ECDC4, #9D4EDD)'
                }}
              />
            </div>
          </div>

          <div className="combo-display">
            {gameState.combo > 2 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="combo-text"
              >
                🔥 COMBO x{gameState.combo}!
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Name Input Modal */}
      <AnimatePresence>
        {showNameInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="name-input-modal"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="name-input-content"
            >
              <h3>🏷️ Masukkan Nama Anda</h3>
              <input
                type="text"
                placeholder="Nama pemain..."
                maxLength={20}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    submitName(e.target.value.trim());
                  }
                }}
                className="name-input"
                autoFocus
              />
              <div className="name-buttons">
                <button onClick={() => submitName('Anonymous')} className="skip-btn">
                  Lewati
                </button>
                <button onClick={(e) => {
                  const input = e.target.parentElement.parentElement.querySelector('input');
                  if (input.value.trim()) submitName(input.value.trim());
                }} className="submit-btn">
                  Mulai!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Game Layout */}
      <div className="game-layout">
        {/* Current Blocks Panel */}
        <motion.div 
          className="blocks-panel"
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <h3>🧩 Blok Saat Ini</h3>
          <div className="current-blocks">
            {gameState.currentBlocks.map((block, index) => (
              <motion.div
                key={block.id}
                className="block-preview"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  backgroundColor: block.color === 'rainbow' ? 
                    `linear-gradient(45deg, ${BLOCK_THEMES.rainbow.colors.join(', ')})` : 
                    block.color
                }}
                onMouseDown={(e) => handleMouseDown(e, block)}
              >
                <div className="block-shape">
                  {block.shape.map((row, y) => (
                    <div key={y} className="block-row">
                      {row.map((cell, x) => (
                        <div
                          key={x}
                          className={`block-cell-preview ${cell ? 'filled' : ''}`}
                          style={{
                            backgroundColor: cell ? (block.color === 'rainbow' ? 
                              BLOCK_THEMES.rainbow.colors[(y * row.length + x) % BLOCK_THEMES.rainbow.colors.length] : 
                              block.color) : 'transparent'
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="block-info">
                  <span>{block.emoji}</span>
                  <span>{BLOCK_TYPES[block.type].points}pts</span>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const rotated = gameState.currentBlocks.map(rotateBlock);
              setGameState(prev => ({ ...prev, currentBlocks: rotated }));
            }}
            className="rotate-btn"
          >
            <RotateCcw className="icon" />
            Putar
          </motion.button>
        </motion.div>

        {/* Main Game Grid */}
        <motion.div 
          className="game-grid-container"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <div 
            className="grid-container"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="game-grid">
              {gameState.grid.map((row, y) => (
                <div key={y} className="grid-row">
                  {row.map((cell, x) => (
                    <motion.div
                      key={`${x}-${y}`}
                      className={`grid-cell ${cell !== 0 ? 'filled' : ''}`}
                      style={{
                        width: BLOCK_SIZE,
                        height: BLOCK_SIZE,
                        backgroundColor: cell !== 0 ? cell : 'rgba(255,255,255,0.1)',
                        borderColor: gameState.rainbowMode ? 
                          BLOCK_THEMES.rainbow.colors[(x + y) % BLOCK_THEMES.rainbow.colors.length] : 
                          'rgba(255,255,255,0.2)'
                      }}
                      whileHover={{ scale: cell === 0 ? 1.05 : 1 }}
                      onClick={() => {
                        if (selectedBlock && cell === 0) {
                          if (placeBlock(selectedBlock, x, y)) {
                            setSelectedBlock(null);
                          }
                        }
                      }}
                    >
                      {cell !== 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="block-content"
                        >
                          {BLOCK_TYPES[Object.keys(BLOCK_TYPES).find(key => BLOCK_TYPES[key].color === cell)]?.emoji || '⬜'}
                        </motion.div>
                      )}
                      
                      {/* Preview for dragged block */}
                      {gameState.previewPosition && 
                       gameState.previewPosition.x === x && 
                       gameState.previewPosition.y === y && 
                       draggedBlock && (
                        <motion.div
                          className="block-preview-overlay"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.7 }}
                        >
                          {draggedBlock.shape.map((row, py) => (
                            <div key={py} className="preview-row">
                              {row.map((cell, px) => (
                                <div
                                  key={px}
                                  className={`preview-cell ${cell ? 'filled' : ''}`}
                                  style={{
                                    backgroundColor: cell ? (draggedBlock.color === 'rainbow' ? 
                                      BLOCK_THEMES.rainbow.colors[(py * row.length + px) % BLOCK_THEMES.rainbow.colors.length] : 
                                      draggedBlock.color) : 'transparent'
                                  }}
                                />
                              ))}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>

            {/* Particles overlay */}
            <div className="particles-overlay">
              {gameState.particles.map(particle => (
                <motion.div
                  key={particle.id}
                  className="particle"
                  style={{
                    left: particle.x,
                    top: particle.y,
                    width: particle.size,
                    height: particle.size,
                    backgroundColor: particle.color,
                    borderRadius: '50%'
                  }}
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 1 }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Game Status Panel */}
        <motion.div 
          className="status-panel"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7, type: "spring" }}
        >
          <div className="player-info">
            <h4>👤 Pemain</h4>
            <p>{gameState.playerName || 'Anonymous'}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNameInput(true)}
              className="edit-name-btn"
            >
              <Edit3 className="icon" />
              Edit
            </motion.button>
          </div>

          <div className="power-ups">
            <h4>⚡ Power-ups</h4>
            <div className="power-up-list">
              {Object.entries(POWER_UPS).map(([key, powerUp]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="power-up-item"
                  style={{ backgroundColor: powerUp.color }}
                >
                  {powerUp.name.split(' ')[0]}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="next-blocks">
            <h4>➡️ Selanjutnya</h4>
            <div className="next-blocks-preview">
              {/* Could show next blocks here */}
              <div className="next-placeholder">
                <Sparkles className="icon" />
                <span>Surprise!</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Menu Screen dengan animasi lucu */}
      {gameState.status === 'menu' && (
        <motion.div
          initial={{ scale: 0, rotate: -360 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="menu-screen"
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="menu-blocks"
          >
            🧩
          </motion.div>
          
          <h2>Selamat Datang di Rainbow Block Blast!</h2>
          <p>Susun blok, buat garis, dan kumpulkan rainbow! 🌈</p>
          
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={startGame}
            className="start-button"
            style={{ 
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #9D4EDD)'
            }}
          >
            <Play className="icon" />
            Mulai Bermain!
          </motion.button>

          <div className="menu-instructions">
            <p><strong>🎮 Cara Bermain:</strong></p>
            <p>• Drag blok ke grid</p>
            <p>• Buat garis horizontal/vertikal penuh</p>
            <p>• Gunakan power-up untuk bantuan!</p>
          </div>
        </motion.div>
      )}

      {/* Game Over Screen */}
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
            className="sad-blocks"
          >
            🧩😢
          </motion.div>
          
          <h3>Grid Penuh! Game Over!</h3>
          
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
              <Star className="icon" />
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
            onClick={() => initializeGame()}
            className="restart-button"
            style={{ 
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #9D4EDD)'
            }}
          >
            <RotateCcw className="icon" />
            Main Lagi
          </motion.button>
        </motion.div>
      )}

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

export default BlockBlast;

