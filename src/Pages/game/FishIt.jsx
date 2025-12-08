// Fishit.jsx - FIXED VERSION
import React, { useState, useEffect, useRef, useCallback } from 'react'; // TAMBAHKAN useState import
import './Fishit.css';

// Import images (pastikan file ini ada di folder public/images/)
const FISH_IMAGES = {
  normal: '/images/fish-normal.png',
  rare: '/images/fish-rare.png',
  legendary: '/images/fish-legendary.png'
};

const HOOK_IMAGE = '/images/hook.png';
const BACKGROUND_IMAGE = '/images/underwater-bg.jpg';

const Fishit = () => {
  // FIX: Pastikan semua useState sudah diimport dari React
  const [score, setScore] = useState(0);
  const [fish, setFish] = useState([]);
  const [hook, setHook] = useState({ x: 200, y: 100 });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [fishesCaught, setFishesCaught] = useState(0);
  const [isReeling, setIsReeling] = useState(false);
  const [bait, setBait] = useState({ x: 200, y: 150 });
  const [caughtFish, setCaughtFish] = useState(null);
  
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const hookImageRef = useRef(new Image());
  const backgroundImageRef = useRef(new Image());

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const FISH_TYPES = {
    normal: { points: 10, speed: 2, size: 40, color: '#FFD700' },
    rare: { points: 25, speed: 3, size: 35, color: '#FF6B6B' },
    legendary: { points: 50, speed: 4, size: 30, color: '#4ECDC4' }
  };

  // Initialize images
  useEffect(() => {
    // Load images dengan error handling
    hookImageRef.current.src = HOOK_IMAGE;
    hookImageRef.current.onerror = () => {
      console.log('Hook image failed to load, using fallback');
      // Fallback ke canvas drawing
    };

    backgroundImageRef.current.src = BACKGROUND_IMAGE;
    backgroundImageRef.current.onerror = () => {
      console.log('Background image failed to load, using fallback');
    };

    // Initialize game jika sudah ada canvas
    if (canvasRef.current) {
      initializeGame();
    }
  }, []);

  const initializeGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Reset game state
    setScore(0);
    setFish([]);
    setFishesCaught(0);
    setLevel(1);
    setGameOver(false);
    setCaughtFish(null);
    setIsReeling(false);

    // Spawn initial fish
    spawnFish();
  };

  const spawnFish = () => {
    const newFish = [];
    const fishCount = 5 + level * 2;

    for (let i = 0; i < fishCount; i++) {
      const fishType = Math.random() < 0.6 ? 'normal' : 
                      Math.random() < 0.8 ? 'rare' : 'legendary';
      
      const fishData = {
        id: i,
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
        type: fishType,
        direction: Math.random() < 0.5 ? -1 : 1,
        caught: false,
        size: FISH_TYPES[fishType].size,
        color: FISH_TYPES[fishType].color
      };

      newFish.push(fishData);
    }

    setFish(newFish);
  };

  const startGame = () => {
    setGameStarted(true);
    initializeGame();
    gameLoop();
  };

  const gameLoop = () => {
    if (gameOver) return;

    updateGame();
    drawGame();

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const updateGame = () => {
    // Update fish positions
    setFish(prevFish => 
      prevFish.map(f => {
        if (f.caught) return f;

        let newX = f.x + (FISH_TYPES[f.type].speed * f.direction);
        
        // Reverse direction if hitting boundaries
        if (newX <= 0 || newX >= CANVAS_WIDTH - f.size) {
          f.direction *= -1;
          newX = f.x + (FISH_TYPES[f.type].speed * f.direction);
        }

);
        }

        return { ...f, x: newX };
      })
    );

    // Check for catches
    checkCatch();
  };

  const checkCatch = () => {
    fish.forEach(f => {
      if (f.caught || !gameStarted) return;

      const distance = Math.sqrt(
        Math.pow(bait.x - f.x, 2) + Math.pow(bait.y - f.y, 2)
      );

      if (distance < 30) {
        catchFish(f);
      }
    });
  };

  const catchFish = (fishToCatch) => {
    setCaughtFish(fishToCatch);
    setIsReeling(true);
    
    // Update fish state
    setFish(prevFish => 
      prevFish.map(f => 
        f.id === fishToCatch.id ? { ...f, caught: true } : f
      )
    );

    // Reel in animation
    setTimeout(() => {
      setScore(prev => prev + FISH_TYPES[fishToCatch.type].points);
      setFishesCaught(prev => prev + 1);
      
      // Remove caught fish
      setFish(prevFish => prevFish.filter(f => f.id !== fishToCatch.id));
      
      setCaughtFish(null);
      setIsReeling(false);

      // Check level up
      if (fishesCaught + 1 >= 5 * level) {
        setLevel(prev => prev + 1);
      }

      // Spawn new fish if all caught
      if (fish.filter(f => !f.caught).length <= 1) {
        setTimeout(spawnFish, 1000);
      }
    }, 1000);
  };

  const moveHook = (direction) => {
    if (isReeling) return;

    setHook(prev => {
      let newX = prev.x;
      let newY = prev.y;

      switch(direction) {
        case 'left':
          newX = Math.max(0, prev.x - 10);
          break;
        case 'right':
          newX = Math.min(CANVAS_WIDTH - 20, prev.x + 10);
          break;
        case 'up':
          newY = Math.max(0, prev.y - 10);
          break;
        case 'down':
          newY = Math.min(CANVAS_HEIGHT - 20, prev.y + 10);
          break;
      }

      // Update bait position
      setBait({ x: newX, y: newY + 50 });

      return { x: newX, y: newY };
    });
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background
    if (backgroundImageRef.current.complete) {
      ctx.drawImage(backgroundImageRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      // Fallback background
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#4682B4');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Draw fish
    fish.forEach(f => {
      if (f.caught) return;

      ctx.save();
      
      // Fish body
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.ellipse(f.x, f.y, f.size/2, f.size/3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fish tail
      ctx.beginPath();
      ctx.moveTo(f.x - f.size/2, f.y);
      ctx.lineTo(f.x - f.size, f.y - f.size/4);
      ctx.lineTo(f.x - f.size, f.y + f.size/4);
      ctx.closePath();
      ctx.fill();

      // Fish eye
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(f.x + f.size/4, f.y - f.size/6, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(f.x + f.size/4, f.y - f.size/6, 1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // Draw hook and line
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hook.x, 0);
    ctx.lineTo(hook.x, hook.y);
    ctx.stroke();

    if (hookImageRef.current.complete) {
      ctx.drawImage(hookImageRef.current, hook.x - 10, hook.y, 20, 20);
    } else {
      // Fallback hook
      ctx.fillStyle = '#C0C0C0';
      ctx.beginPath();
      ctx.arc(hook.x, hook.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw bait
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.arc(bait.x, bait.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw caught fish
    if (caughtFish && isReeling) {
      ctx.save();
      ctx.fillStyle = caughtFish.color;
      ctx.beginPath();
      ctx.arc(bait.x, bait.y + 10, caughtFish.size/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw UI
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Level: ${level}`, 10, 60);
    ctx.fillText(`Caught: ${fishesCaught}`, 10, 90);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted || gameOver) return;

      switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          moveHook('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveHook('right');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          moveHook('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          moveHook('down');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver, isReeling]);

  // Touch controls untuk mobile
  const handleTouch = (direction) => {
    if (!gameStarted || gameOver || isReeling) return;
    moveHook(direction);
  };

  return (
    <div className="fishit-game">
      <div className="game-header">
        <h2>🎣 Fishit Game</h2>
        <div className="score-board">
          <span>Score: {score}</span>
          <span>Level: {level}</span>
          <span>Caught: {fishesCaught}</span>
        </div>
      </div>

      <div className="game-container">
        <canvas
          ref={canvasRef}
          className="game-canvas"
          style={{
            border: '2px solid #333',
            backgroundColor: '#87CEEB'
          }}
        />

        {!gameStarted && (
          <div className="game-overlay">
            <div className="start-menu">
              <h3>🎣 Fishit Game</h3>
              <p>Tangkap ikan sebanyak-banyaknya!</p>
              <button onClick={startGame} className="start-btn">
                Mulai Game
              </button>
              <div className="instructions">
                <p>Gunakan tombol panah atau WASD untuk menggerakkan kail</p>
                <p>Tangkap ikan dengan mendekati mereka</p>
              </div>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="game-overlay">
            <div className="game-over-menu">
              <h3>Game Over!</h3>
              <p>Score Akhir: {score}</p>
              <p>Ikan tertangkap: {fishesCaught}</p>
              <button onClick={startGame} className="restart-btn">
                Main Lagi
              </button>
            </div>
          </div>
        )}

        {/* Mobile Controls */}
        <div className="mobile-controls">
          <div className="control-row">
            <button onClick={() => handleTouch('up')}>⬆️</button>
          </div>
          <div className="control-row">
            <button onClick={() => handleTouch('left')}>⬅️</button>
            <button onClick={() => handleTouch('down')}>⬇️</button>
            <button onClick={() => handleTouch('right')}>➡️</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fishit;

