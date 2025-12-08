// src/Pages/game/SnakeGame.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Trophy, Apple, Star, Sparkles } from 'lucide-react';
import './styles/SnakeGame.css';

const SnakeGame = () => {
  const BOARD_SIZE = 20;
  const CELL_SIZE = 30;
  const GAME_SPEED = 120;

  // Game state dengan tema rainbow dan animasi
  const [gameState, setGameState] = useState({
    status: 'menu', // menu, playing, paused, gameOver
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15, type: 'normal' },
    direction: { x: 0, y: 0 },
    score: 0,
    level: 1,
    combo: 0,
    specialFood: null,
    particles: [],
    rainbowMode: false,
    rainbowTimer: 0
  });

  const [selectedSnake, setSelectedSnake] = useState('rainbow');
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(0.7);

  // Snake themes dengan animasi dan efek visual
  const SNAKE_THEMES = {
    rainbow: {
      name: '🌈 Rainbow Snake',
      colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
      special: 'rainbow-trail'
    },
    neon: {
      name: '⚡ Neon Snake',
      colors: ['#00FFFF', '#FF00FF', '#FFFF00'],
      special: 'glow-effect'
    },
    galaxy: {
      name: '🌌 Galaxy Snake',
      colors: ['#9D4EDD', '#C77DFF', '#E0AAFF'],
      special: 'star-particles'
    },
    fire: {
      name: '🔥 Fire Snake',
      colors: ['#FF4500', '#FF6347', '#FFD700'],
      special: 'fire-trail'
    }
  };

  // Food types dengan animasi dan efek khusus
  const FOOD_TYPES = {
    normal: { points: 10, color: '#FF6B6B', emoji: '🍎', effect: 'none' },
    golden: { points: 50, color: '#FFD700', emoji: '⭐', effect: 'speed-boost' },
    rainbow: { points: 25, color: '#FF69B4', emoji: '🌈', effect: 'rainbow-mode' },
    mega: { points: 100, color: '#9400D3', emoji: '💎', effect: 'mega-grow' }
  };

  // Particle system untuk efek visual
  const createParticles = (x, y, color, count = 10) => {
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        id: Date.now() + i,
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color,
        size: Math.random() * 6 + 2,
        life: 30,
        type: 'food-effect'
      });
    }
    
    setGameState(prev => ({
      ...prev,
      particles: [...prev.particles, ...particles]
    }));
  };

  // Rainbow trail effect
  const createRainbowTrail = (x, y) => {
    if (!gameState.rainbowMode) return;

    const particles = [];
    for (let i = 0; i < 5; i++) {
      const colorIndex = Math.floor(Math.random() * SNAKE_THEMES.rainbow.colors.length);
      particles.push({
        id: Date.now() + i,
        x: x * CELL_SIZE + Math.random() * CELL_SIZE,
        y: y * CELL_SIZE + Math.random() * CELL_SIZE,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: SNAKE_THEMES.rainbow.colors[colorIndex],
        size: Math.random() * 4 + 1,
        life: 20,
        type: 'rainbow-trail'
      });
    }
    
    setGameState(prev => ({
      ...prev,
      particles: [...prev.particles, ...particles]
    }));
  };

  // Initialize game dengan animasi lucu
  const initializeGame = useCallback(() => {
    setGameState({
      status: 'menu',
      snake: [{ x: 10, y: 10 }],
      food: generateFood([{ x: 10, y: 10 }], 'normal'),
      direction: { x: 0, y: 0 },
      score: 0,
      level: 1,
      combo: 0,
      specialFood: null,
      particles: [],
      rainbowMode: false,
      rainbowTimer: 0
    });
    setIsPaused(false);
  }, []);

  // Generate food dengan animasi spawn
  const generateFood = useCallback((currentSnake, type = 'normal') => {
    let newFood;
    let attempts = 0;
    
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
        type: type,
        spawnTime: Date.now()
      };
      attempts++;
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y) && attempts < 100);
    
    return newFood;
  }, []);

  // Spawn special food dengan animasi
  const spawnSpecialFood = useCallback(() => {
    if (Math.random() < 0.1) { // 10% chance
      const types = Object.keys(FOOD_TYPES).filter(type => type !== 'normal');
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      setGameState(prev => ({
        ...prev,
        specialFood: generateFood(prev.snake, randomType)
      }));

      // Remove after 5 seconds
      setTimeout(() => {
        setGameState(prev => ({ ...prev, specialFood: null }));
      }, 5000);
    }
  }, [generateFood]);

  // Start game dengan animasi countdown
  const startGame = () => {
    // Countdown animation
    let count = 3;
    const countdown = setInterval(() => {
      if (count > 0) {
        // Show countdown animation
        const countdownElement = document.createElement('div');
        countdownElement.className = 'countdown-number';
        countdownElement.textContent = count;
        document.body.appendChild(countdownElement);
        
        setTimeout(() => {
          countdownElement.remove();
        }, 1000);
        
        count--;
      } else {
        clearInterval(countdown);
        setGameState(prev => ({ 
          ...prev, 
          status: 'playing',
          direction: { x: 1, y: 0 }
        }));
        
        // Start spawning special food
        const specialFoodInterval = setInterval(() => {
          if (gameState.status === 'playing') {
            spawnSpecialFood();
          } else {
            clearInterval(specialFoodInterval);
          }
        }, 8000);
      }
    }, 1000);
  };

  // Movement dengan animasi smooth dan input yang responsive
  const handleKeyPress = useCallback((e) => {
    if (gameState.status !== 'playing') {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        startGame();
      }
      return;
    }

    switch(e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (gameState.direction.y === 0) {
          setGameState(prev => ({ ...prev, direction: { x: 0, y: -1 } }));
          createRainbowTrail(gameState.snake[0].x, gameState.snake[0].y);
        }
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (gameState.direction.y === 0) {
          setGameState(prev => ({ ...prev, direction: { x: 0, y: 1 } }));
          createRainbowTrail(gameState.snake[0].x, gameState.snake[0].y);
        }
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (gameState.direction.x === 0) {
          setGameState(prev => ({ ...prev, direction: { x: -1, y: 0 } }));
          createRainbowTrail(gameState.snake[0].x, gameState.snake[0].y);
        }
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (gameState.direction.x === 0) {
          setGameState(prev => ({ ...prev, direction: { x: 1, y: 0 } }));
          createRainbowTrail(gameState.snake[0].x, gameState.snake[0].y);
        }
        break;
      case ' ':
        e.preventDefault();
        if (gameState.status === 'playing') {
          setIsPaused(!isPaused);
        }
        break;
    }
  }, [gameState.status, gameState.direction, gameState.snake]);

  // Touch controls dengan gesture yang smooth
  const handleTouchMove = (direction) => {
    if (gameState.status !== 'playing' || isPaused) return;

    switch(direction) {
      case 'up':
        if (gameState.direction.y === 0) {
          setGameState(prev => ({ ...prev, direction: { x: 0, y: -1 } }));
          createRainbowTrail(gameState.snake[0].x, gameState.snake[0].y);
        }
        break;
      case 'down':
        if (gameState.direction.y === 0) {
          setGameState(prev => ({ ...prev, direction: { x: 0, y: 1 } }));
          createRainbowTrail(gameState.snake[0].x, gameState.snake[0].y);
        }
        break;
      case 'left':
        if (gameState.direction.x === 0) {
          setGameState(prev => ({ ...prev, direction: { x: -1, y: 0 } }));
          createRainbowTrail(gameState.snake[0].x, gameState.snake[0].y);
        }
        break;
      case 'right':
        if (gameState.direction.x === 0) {
          setGameState(prev => ({ ...prev, direction: { x: 1, y: 0 } }));
          createRainbowTrail(gameState.snake[0].x, gameState.snake[0].y);
        }
        break;
    }
  };

  // Game loop dengan animasi smooth dan particle updates
  useEffect(() => {
    if (gameState.status !== 'playing' || isPaused) return;

    const gameInterval = setInterval(() => {
      setGameState(prev => {
        const newState = { ...prev };
        
        // Update snake position
        const newSnake = [...prev.snake];
        const head = { ...newSnake[0] };
        
        head.x += prev.direction.x;
        head.y += prev.direction.y;

        // Check walls
        if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
          newState.status = 'gameOver';
          return newState;
        }

        // Check self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          newState.status = 'gameOver';
          return newState;
        }

        newSnake.unshift(head);

        // Check food collision
        if (head.x === prev.food.x && head.y === prev.food.y) {
          // Handle food effects
          const foodType = FOOD_TYPES[prev.food.type];
          newState.score += foodType.points;
          newState.combo += 1;
          
          // Create particles
          createParticles(prev.food.x, prev.food.y, foodType.color, 15);
          
          // Apply special effects
          if (prev.food.type === 'golden') {
            // Speed boost
            setTimeout(() => {
              setGameState(current => ({ ...current, combo: 0 }));
            }, 5000);
          } else if (prev.food.type === 'rainbow') {
            // Rainbow mode
            newState.rainbowMode = true;
            newState.rainbowTimer = 300; // 5 seconds
          } else if (prev.food.type === 'mega') {
            // Mega grow - add 5 segments
            for (let i = 0; i < 5; i++) {
              newSnake.push({ ...newSnake[newSnake.length - 1] });
            }
          }
          
          // Generate new food
          newState.food = generateFood(newSnake);
          
          // Level progression
          if (newState.score > newState.level * 100) {
            newState.level += 1;
          }
        } else {
          newSnake.pop();
        }

        // Update rainbow mode
        if (newState.rainbowMode) {
          newState.rainbowTimer -= 1;
          if (newState.rainbowTimer <= 0) {
            newState.rainbowMode = false;
          }
        }

        // Update particles
        newState.particles = prev.particles.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vx: particle.vx * 0.98,
          vy: particle.vy * 0.98,
          life: particle.life - 1
        })).filter(particle => particle.life > 0);

        return {
          ...newState,
          snake: newSnake
        };
      });
    }, GAME_SPEED);

    return () => clearInterval(gameInterval);
  }, [gameState.status, isPaused, gameState.direction, generateFood]);

  // Keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Render game board dengan animasi dan efek visual
  const renderGameBoard = () => {
    if (gameState.status === 'menu') return null;

    return (
      <div className="snake-board-container">
        <div className="snake-board">
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
            const x = index % BOARD_SIZE;
            const y = Math.floor(index / BOARD_SIZE);
            const isSnake = gameState.snake.some((segment, segIndex) => {
              if (segment.x === x && segment.y === y) {
                // Create rainbow trail for head
                if (segIndex === 0 && gameState.rainbowMode) {
                  createRainbowTrail(x, y);
                }
                return true;
              }
              return false;
            });
            
            const isHead = gameState.snake[0].x === x && gameState.snake[0].y === y;
            const isFood = gameState.food.x === x && gameState.food.y === y;
            const isSpecialFood = gameState.specialFood && gameState.specialFood.x === x && gameState.specialFood.y === y;

            let cellClass = 'snake-cell';
            if (isFood) cellClass += ' food';
            if (isSpecialFood) cellClass += ' special-food';
            if (isSnake) {
              cellClass += ' snake';
              if (isHead) cellClass += ' head';
              if (gameState.rainbowMode) cellClass += ' rainbow';
            }

            // Snake segment color based on theme
            let snakeColor = '';
            if (isSnake) {
              const segmentIndex = gameState.snake.findIndex(seg => seg.x === x && seg.y === y);
              const theme = SNAKE_THEMES[selectedSnake];
              
              if (theme.name.includes('Rainbow')) {
                snakeColor = theme.colors[segmentIndex % theme.colors.length];
              } else {
                snakeColor = theme.colors[0];
              }
            }

            return (
              <motion.div
                key={index}
                className={cellClass}
                style={{
                  width: `${CELL_SIZE}px`,
                  height: `${CELL_SIZE}px`,
                  backgroundColor: isSnake ? snakeColor : '',
                  borderColor: gameState.rainbowMode ? 
                    SNAKE_THEMES.rainbow.colors[index % SNAKE_THEMES.rainbow.colors.length] : 
                    'rgba(255,255,255,0.1)'
                }}
                initial={isFood ? { scale: 0, rotate: 180 } : false}
                animate={isFood ? { 
                  scale: [1, 1.2, 1], 
                  rotate: [0, 360],
                  y: [0, -5, 0]
                } : {}}
                transition={isFood ? { 
                  duration: 1, 
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {}}
              >
                {/* Food emoji with animation */}
                {isFood && (
                  <motion.span
                    className="food-emoji"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {FOOD_TYPES[gameState.food.type].emoji}
                  </motion.span>
                )}
                
                {/* Special food with pulsing effect */}
                {isSpecialFood && (
                  <motion.span
                    className="special-food-emoji"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      rotate: [0, 360]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    {FOOD_TYPES[gameState.specialFood.type].emoji}
                  </motion.span>
                )}
                
                {/* Snake head with eyes */}
                {isHead && (
                  <div className="snake-head-face">
                    <motion.div 
                      className="snake-eye left"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <motion.div 
                      className="snake-eye right"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    {gameState.rainbowMode && (
                      <motion.div
                        className="rainbow-aura"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        🌈
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
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
    );
  };

  // Main UI dengan animasi lucu dan tema rainbow
  return (
    <div className="snake-game-container">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="bg-pattern"></div>
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="floating-emoji"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 15}px`
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, -20, 0],
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {['🐍', '🌈', '✨', '🍎', '⭐'][i % 5]}
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
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            🌈 Rainbow Snake Adventure
          </motion.h1>
          
          <div className="snake-selection">
            <span>Pilih Ular: </span>
            <select 
              value={selectedSnake} 
              onChange={(e) => setSelectedSnake(e.target.value)}
              className="snake-select"
            >
              {Object.entries(SNAKE_THEMES).map(([key, theme]) => (
                <option key={key} value={key}>{theme.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="header-right">
          <div className="score-display">
            <motion.span 
              key={gameState.score}
              initial={{ scale: 1.5, y: -20 }}
              animate={{ scale: 1, y: 0 }}
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
                animate={{ width: `${(gameState.score % 100)}%` }}
                transition={{ duration: 0.5 }}
                style={{ 
                  background: `linear-gradient(90deg, ${SNAKE_THEMES[selectedSnake].colors[0]}, ${SNAKE_THEMES[selectedSnake].colors[1] || SNAKE_THEMES[selectedSnake].colors[0]})`
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
                style={{ color: SNAKE_THEMES[selectedSnake].colors[0] }}
              >
                🔥 COMBO x{gameState.combo}!
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Game Area */}
      <div className="game-area">
        {renderGameBoard()}

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
                y: [0, -10, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="menu-snake"
            >
              🐍
            </motion.div>
            
            <h2>Selamat Datang di Rainbow Snake!</h2>
            <p>Gerakkan ular rainbow-mu dan kumpulkan makanan berwarna-warni!</p>
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={startGame}
              className="start-button"
              style={{ 
                background: `linear-gradient(45deg, ${SNAKE_THEMES[selectedSnake].colors.join(', ')})`
              }}
            >
              <Play className="icon" />
              Mulai Petualangan!
            </motion.button>

            <div className="menu-instructions">
              <p><strong>🎮 Kontrol:</strong></p>
              <p>• Arrow Keys / WASD untuk bergerak</p>
              <p>• SPACE untuk pause</p>
              <p>• Kumpulkan makanan spesial untuk efek keren!</p>
            </div>
          </motion.div>
        )}

        {/* Pause Screen */}
        {gameState.status === 'playing' && isPaused && (
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
            <p>Ular sedang istirahat... 🐍💤</p>
            <button onClick={() => setIsPaused(false)} className="resume-btn">
              <Play className="icon" />
              Lanjutkan
            </button>
          </motion.div>
        )}

        {/* Game Over Screen dengan animasi sedih */}
        {gameState.status === 'gameOver' && (
          <motion.div
            initial={{ scale: 0, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="game-over-screen"
          >
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                y: [0, -20, 0]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="sad-snake"
            >
              🐍😢
            </motion.div>
            
            <h3>Oh Tidak! Ular Menabrak!</h3>
            
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
                <span>Combo Tertinggi: {gameState.combo}</span>
              </motion.div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={initializeGame}
              className="restart-button"
              style={{ 
                background: `linear-gradient(45deg, ${SNAKE_THEMES[selectedSnake].colors.join(', ')})`
              }}
            >
              <RotateCcw className="icon" />
              Coba Lagi
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Control Panel dengan animasi */}
      <motion.div 
        className="control-panel"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        {gameState.status === 'playing' && !isPaused && (
          <div className="game-controls">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPaused(true)}
              className="control-btn pause"
            >
              <Pause className="icon" />
            </motion.button>

            <div className="touch-controls">
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: '#FF6B6B' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleTouchMove('left')}
                className="direction-btn left"
              >
                ←
              </motion.button>
              
              <div className="vertical-controls">
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: '#4ECDC4' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleTouchMove('up')}
                  className="direction-btn up"
                >
                  ↑
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: '#45B7D1' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleTouchMove('down')}
                  className="direction-btn down"
                >
                  ↓
                </motion.button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: '#96CEB4' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleTouchMove('right')}
                className="direction-btn right"
              >
                →
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Special effects overlay */}
      <AnimatePresence>
        {gameState.rainbowMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rainbow-overlay"
          >
            <div className="rainbow-text">🌈 RAINBOW MODE AKTIF! 🌈</div>
          </motion.div>
        )}
      </AnimatePresence>

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

export default SnakeGame;

