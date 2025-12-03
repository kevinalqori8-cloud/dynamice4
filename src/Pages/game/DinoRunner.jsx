import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Button, Typography, Box, Paper, Dialog, DialogTitle, 
  DialogContent, DialogActions, Chip 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../../hooks/useFirebaseData';
import { userService } from '../../service/firebaseService';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const DinoRunner = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  
  // Game states
  const [gameState, setGameState] = useState('ready'); // ready, playing, over
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(5);
  const [gameSpeed, setGameSpeed] = useState(1);
  
  // Dino states
  const [dinoY, setDinoY] = useState(300); // Ground level
  const [dinoVelocityY, setDinoVelocityY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isDucking, setIsDucking] = useState(false);
  
  // Obstacles
  const [obstacles, setObstacles] = useState([]);
  const [clouds, setClouds] = useState([]);
  
  // Game constants
  const GROUND_Y = 300;
  const JUMP_FORCE = -15;
  const GRAVITY = 0.8;
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 400;
  
  const { data: userData } = useUserData(playerName || "guest");
  const money = userData?.money || 0;

  // Initialize
  useEffect(() => {
    const savedName = localStorage.getItem('dino_player_name');
    if (savedName) {
      setPlayerName(savedName);
      setShowNameInput(false);
    } else {
      setShowNameInput(true);
    }
    
    const savedHighScore = parseInt(localStorage.getItem('dino_high_score') || '0');
    setHighScore(savedHighScore);
  }, []);

  const savePlayerName = async (name) => {
    if (!name.trim()) return;
    setPlayerName(name.trim());
    localStorage.setItem('dino_player_name', name.trim());
    setShowNameInput(false);
    
    await userService.saveUserData(name.trim(), {
      nama: name.trim(),
      money: money || 1000,
      achievements: []
    });
  };

  // Physics engine
  useEffect(() => {
    if (gameState !== 'playing') return;

    const physicsInterval = setInterval(() => {
      // Dino physics
      setDinoVelocityY(prev => prev + GRAVITY);
      setDinoY(prev => {
        const newY = prev + dinoVelocityY;
        if (newY >= GROUND_Y) {
          setDinoVelocityY(0);
          setIsJumping(false);
          return GROUND_Y;
        }
        return newY;
      });

      // Move obstacles
      setObstacles(prev => {
        const updated = prev.map(obs => ({
          ...obs,
          x: obs.x - speed * gameSpeed
        })).filter(obs => obs.x > -100);

        // Add new obstacles
        if (updated.length === 0 || updated[updated.length - 1].x < GAME_WIDTH - 300) {
          const obstacleType = Math.random() > 0.5 ? 'cactus' : 'bird';
          updated.push({
            id: Date.now(),
            x: GAME_WIDTH,
            y: obstacleType === 'bird' ? GROUND_Y - 100 : GROUND_Y - 40,
            type: obstacleType,
            width: obstacleType === 'bird' ? 40 : 30,
            height: obstacleType === 'bird' ? 30 : 40
          });
        }

        return updated;
      });

      // Move clouds
      setClouds(prev => {
        const updated = prev.map(cloud => ({
          ...cloud,
          x: cloud.x - 1
        })).filter(cloud => cloud.x > -100);

        // Add new clouds
        if (Math.random() < 0.01) {
          updated.push({
            id: Date.now(),
            x: GAME_WIDTH,
            y: Math.random() * 150 + 50,
            size: Math.random() * 30 + 20
          });
        }

        return updated;
      });

      // Increase speed gradually
      setGameSpeed(prev => Math.min(prev + 0.001, 3));
      setScore(prev => prev + 1);
      setSpeed(prev => Math.min(prev + 0.01, 15));

    }, 16); // 60 FPS

    return () => clearInterval(physicsInterval);
  }, [gameState, dinoVelocityY, speed, gameSpeed]);

  // Collision detection
  useEffect(() => {
    if (gameState !== 'playing') return;

    const dinoRect = {
      x: 100,
      y: isDucking ? dinoY + 20 : dinoY,
      width: isDucking ? 60 : 40,
      height: isDucking ? 30 : 60
    };

    const collision = obstacles.some(obs => {
      return (
        dinoRect.x < obs.x + obs.width &&
        dinoRect.x + dinoRect.width > obs.x &&
        dinoRect.y < obs.y + obs.height &&
        dinoRect.y + dinoRect.height > obs.y
      );
    });

    if (collision) {
      setGameState('over');
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('dino_high_score', score.toString());
        
        // Update user money
        const reward = Math.floor(score / 10);
        if (playerName) {
          userService.updateMoney(playerName, money + reward);
        }
      }
    }
  }, [obstacles, dinoY, isDucking, gameState, score, highScore]);

  // Controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;

      switch (e.key) {
        case ' ':
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          if (!isJumping && dinoY >= GROUND_Y) {
            setDinoVelocityY(JUMP_FORCE);
            setIsJumping(true);
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          setIsDucking(true);
          break;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setIsDucking(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, isJumping, dinoY]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setSpeed(5);
    setGameSpeed(1);
    setObstacles([]);
    setClouds([]);
    setDinoY(GROUND_Y);
    setDinoVelocityY(0);
    setIsJumping(false);
    setIsDucking(false);
  };

  const resetGame = () => {
    setGameState('ready');
    setScore(0);
    setSpeed(5);
    setGameSpeed(1);
    setObstacles([]);
    setClouds([]);
    setDinoY(GROUND_Y);
    setDinoVelocityY(0);
    setIsJumping(false);
    setIsDucking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex flex-col items-center justify-center p-4">
      
      {/* Name Input Modal */}
      <AnimatePresence>
        {showNameInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
            >
              <Typography variant="h5" className="text-center mb-4 font-bold">
                🦕 Dino Runner
              </Typography>
              <Typography variant="body1" className="text-center mb-6">
                Masukkan nama Anda untuk mulai bermain!
              </Typography>
              <input
                type="text"
                placeholder="Nama Pemain"
                className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 text-center"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    savePlayerName(e.target.value.trim());
                  }
                }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  const input = document.querySelector('input');
                  if (input?.value.trim()) {
                    savePlayerName(input.value.trim());
                  }
                }}
                className="bg-gradient-to-r from-green-500 to-blue-500"
              >
                Mulai Bermain
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      {playerName && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-4xl mb-4 flex justify-between items-center text-white"
        >
          <Button
            onClick={() => navigate(-1)}
            className="bg-white/20 backdrop-blur-sm"
          >
            ← Kembali
          </Button>
          <div className="text-center">
            <Typography variant="h4" className="font-bold">🦕 Dino Runner</Typography>
            <Typography variant="body1">Score: {score} | High: {highScore}</Typography>
          </div>
          <div className="text-right">
            <Typography variant="body1">Player: {playerName}</Typography>
            <Typography variant="body1">Money: Rp {money.toLocaleString()}</Typography>
          </div>
        </motion.div>
      )}

      {/* Game Area */}
      {playerName && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative bg-gradient-to-b from-blue-300 to-green-300 rounded-2xl overflow-hidden shadow-2xl"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        >
          {/* Clouds */}
          <AnimatePresence>
            {clouds.map(cloud => (
              <motion.div
                key={cloud.id}
                className="absolute bg-white rounded-full opacity-70"
                style={{
                  left: cloud.x,
                  top: cloud.y,
                  width: cloud.size,
                  height: cloud.size * 0.6
                }}
              />
            ))}
          </AnimatePresence>

          {/* Ground */}
          <div 
            className="absolute bottom-0 w-full bg-green-500"
            style={{ height: GAME_HEIGHT - GROUND_Y }}
          />

          {/* Dino */}
          <motion.div
            className="absolute"
            style={{
              left: 100,
              top: isDucking ? dinoY + 20 : dinoY,
              width: isDucking ? 60 : 40,
              height: isDucking ? 30 : 60
            }}
            animate={{
              scaleY: isJumping ? 0.8 : 1,
              rotate: isJumping ? -10 : 0
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-full h-full bg-green-700 rounded-lg flex items-center justify-center text-2xl">
              🦕
            </div>
          </motion.div>

          {/* Obstacles */}
          <AnimatePresence>
            {obstacles.map(obs => (
              <motion.div
                key={obs.id}
                className="absolute"
                style={{
                  left: obs.x,
                  top: obs.y,
                  width: obs.width,
                  height: obs.height
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {obs.type === 'cactus' ? (
                  <div className="w-full h-full bg-green-600 rounded">🌵</div>
                ) : (
                  <div className="w-full h-full bg-yellow-600 rounded">🦅</div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Game Over Overlay */}
          <AnimatePresence>
            {gameState === 'over' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 flex items-center justify-center"
              >
                <div className="bg-white rounded-2xl p-8 text-center">
                  <Typography variant="h4" className="mb-4">💥 Game Over!</Typography>
                  <Typography variant="h6" className="mb-2">Score: {score}</Typography>
                  {score === highScore && score > 0 && (
                    <Typography variant="body1" className="text-green-600 mb-4">
                      🎉 New High Score!
                    </Typography>
                  )}
                  <div className="flex gap-4 justify-center">
                    <Button
                      variant="contained"
                      onClick={startGame}
                      className="bg-gradient-to-r from-green-500 to-blue-500"
                    >
                      <RefreshIcon /> Main Lagi
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={resetGame}
                    >
                      Kembali
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ready State */}
          {gameState === 'ready' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 rounded-2xl p-8 text-center">
                <Typography variant="h4" className="mb-4">🦕 Dino Runner</Typography>
                <Typography variant="body1" className="mb-6">
                  Gunakan SPACEBAR/↑ untuk lompat<br/>
                  ↓ untuk bungkuk
                </Typography>
                <Button
                  variant="contained"
                  onClick={startGame}
                  className="bg-gradient-to-r from-green-500 to-blue-500"
                >
                  Mulai Bermain
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Controls Info */}
      {playerName && gameState === 'playing' && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-4 text-white text-center"
        >
          <div className="flex gap-4 justify-center items-center">
            <Chip icon={<ArrowUpwardIcon />} label="Lompat" color="primary" />
            <Chip icon={<ArrowDownwardIcon />} label="Bungkuk" color="secondary" />
            <Chip label={`Speed: ${gameSpeed.toFixed(1)}x`} color="success" />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DinoRunner;

