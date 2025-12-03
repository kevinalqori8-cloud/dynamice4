import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Button,
  Typography,
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../../hooks/useFirebaseData';
import { userService } from '../../service/firebaseService';
import { useGameOptimization } from '../../hooks/useGameOptimization';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// 🎯 Tema konsisten dengan game lain
const DinoRunner = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Game optimization hook
  const { 
    fps, 
    isMobile, 
    batterySaving, 
    trackGameEvent,
    startFishing // Touch gesture support
  } = useGameOptimization('dinorunner');
  
  // Game states
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(5);
  const [gameSpeed, setGameSpeed] = useState(1);
  
  // Dino states
  const [dinoY, setDinoY] = useState(300);
  const [dinoVelocityY, setDinoVelocityY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isDucking, setIsDucking] = useState(false);
  
  // Obstacles and clouds
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

  // 🎯 FIX: Initialization dengan proper error handling
  useEffect(() => {
    const initializeGame = async () => {
      try {
        setLoading(true);
        
        // Load saved progress
        const savedName = localStorage.getItem('dino_player_name');
        if (savedName) {
          setPlayerName(savedName);
          setShowNameInput(false);
        } else {
          setShowNameInput(true);
        }
        
        const savedHighScore = parseInt(localStorage.getItem('dino_high_score') || '0');
        setHighScore(savedHighScore);
        
        trackGameEvent('game_initialized', { 
          has_saved_name: !!savedName,
          high_score: savedHighScore 
        });
        
      } catch (error) {
        console.error('Initialization error:', error);
        trackGameEvent('initialization_error', { error: error.message });
        // Fallback values
        setPlayerName("Guest");
        setHighScore(0);
      } finally {
        setLoading(false);
      }
    };

    initializeGame();
  }, [trackGameEvent]);

  // 🎯 FIX: Proper name save dengan validation
  const savePlayerName = async (name) => {
    if (!name?.trim()) {
      alert('Nama tidak boleh kosong!');
      return;
    }
    
    try {
      setLoading(true);
      const cleanName = name.trim().slice(0, 20);
      
      setPlayerName(cleanName);
      localStorage.setItem('dino_player_name', cleanName);
      setShowNameInput(false);
      
      trackGameEvent('player_name_set', { name_length: cleanName.length });
      
      // Save to Firebase
      await userService.saveUserData(cleanName, {
        nama: cleanName,
        money: money || 1000,
        achievements: []
      });
      
    } catch (error) {
      console.error('Save player error:', error);
      trackGameEvent('save_player_error', { error: error.message });
      alert('Gagal menyimpan data pemain. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // 🎯 FIX: Game loop dengan proper cleanup
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animationId;
    
    const gameLoop = () => {
      try {
        // Physics calculations
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
            const obstacleType = Math.random() > 0.5 ? 'bird' : 'cactus';
            updated.push({
              id: Date.now() + Math.random(),
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

          if (Math.random() < 0.01) {
            updated.push({
              id: Date.now() + Math.random(),
              x: GAME_WIDTH,
              y: Math.random() * 150 + 50,
              size: Math.random() * 30 + 20
            });
          }

          return updated;
        });

        // Update game speed and score
        setGameSpeed(prev => Math.min(prev + 0.001, 3));
        setScore(prev => prev + 1);
        setSpeed(prev => Math.min(prev + 0.01, 15));

      } catch (error) {
        console.error('Game loop error:', error);
        trackGameEvent('game_loop_error', { error: error.message });
      }
      
      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameState, dinoVelocityY, speed, gameSpeed, trackGameEvent]);

  // 🎯 FIX: Collision detection yang reliable
  useEffect(() => {
    if (gameState !== 'playing') return;

    const checkCollisions = () => {
      try {
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
          handleGameOver();
        }
      } catch (error) {
        console.error('Collision check error:', error);
        trackGameEvent('collision_error', { error: error.message });
      }
    };

    const collisionInterval = setInterval(checkCollisions, 16);
    return () => clearInterval(collisionInterval);
  }, [obstacles, dinoY, isDucking, gameState]);

  // 🎯 FIX: Game over handler yang proper
  const handleGameOver = useCallback(() => {
    setGameState('over');
    
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('dino_high_score', score.toString());
      
      const reward = Math.floor(score / 10);
      if (playerName && reward > 0) {
        userService.updateMoney(playerName, money + reward)
          .catch(error => {
            console.error('Failed to update money:', error);
            trackGameEvent('reward_update_failed', { error: error.message });
          });
      }
    }
    
    trackGameEvent('game_over', { 
      score: score,
      high_score: score > highScore 
    });
  }, [score, highScore, playerName, money, trackGameEvent]);

  // 🎯 FIX: Controls dengan prevent default yang benar
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyPress = (e) => {
      // Prevent default untuk prevent scroll
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case ' ':
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (!isJumping && dinoY >= GROUND_Y) {
            setDinoVelocityY(JUMP_FORCE);
            setIsJumping(true);
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          setIsDucking(true);
          break;
      }
    };

    const handleKeyUp = (e) => {
      if (['ArrowDown', 's', 'S'].includes(e.key)) {
        setIsDucking(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, isJumping, dinoY, GROUND_Y]);

  // 🎯 FIX: Game start dengan proper state management
  const startGame = useCallback(() => {
    // Reset all game states
    setGameState('playing');
    setScore(0);
    setSpeed(5);
    setGameSpeed(1);
    setObstacles([])
    setClouds([])
    setDinoY(GROUND_Y);
    setDinoVelocityY(0);
    setIsJumping(false);
    setIsDucking(false);
    
    trackGameEvent('game_started');
  }, [GROUND_Y, trackGameEvent]);

  const resetGame = useCallback(() => {
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
  }, [GROUND_Y]);

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white', mb: 3 }} />
        <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
          Loading Dino Runner...
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Preparing your prehistoric adventure
        </Typography>
      </Box>
    );
  }

  // 🎯 TEMA KONSISTEN: Gradiente ungu-biru seperti game lainnya
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        position: 'relative',
      }}
    >
      {/* Performance Indicator */}
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          px: 2,
          py: 1,
          borderRadius: 2,
          fontSize: '12px',
        }}
      >
        FPS: {fps} {batterySaving && '🔋'}
      </Box>
      
      {/* Name Input Modal */}
      <AnimatePresence>
        {showNameInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '400px',
                width: '100%',
                margin: '16px',
              }}
            >
              <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#8a2be2' }}>
                🦕 Dino Runner
              </Typography>
              <Typography variant="body1" align="center" paragraph>
                Masukkan nama Anda untuk mulai bermain!
              </Typography>
              <TextField
                fullWidth
                placeholder="Nama Pemain"
                variant="outlined"
                sx={{ mb: 3 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    savePlayerName(e.target.value.trim());
                  }
                }}
                disabled={loading}
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
                disabled={loading}
                sx={{
                  background: 'linear-gradient(45deg, #8a2be2, #00bcd4)',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Mulai Bermain'}
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
          style={{
            width: '100%',
            maxWidth: '1200px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
          }}
        >
          <Button
            onClick={() => navigate(-1)}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
            }}
          >
            ← Kembali
          </Button>
          <Box textAlign="center">
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
              🦕 Dino Runner
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Score: {score} | High: {highScore}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Player: {playerName}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Money: Rp {money.toLocaleString()}
            </Typography>
          </Box>
        </motion.div>
      )}

      {/* Main Game Area */}
      {playerName && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            position: 'relative',
            background: 'linear-gradient(to bottom, #87CEEB, #98FB98)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Game Canvas */}
          <div
            style={{
              width: GAME_WIDTH,
              height: GAME_HEIGHT,
              position: 'relative',
            }}
          >
            {/* Clouds */}
            {clouds.map(cloud => (
              <motion.div
                key={cloud.id}
                style={{
                  position: 'absolute',
                  left: cloud.x,
                  top: cloud.y,
                  width: cloud.size,
                  height: cloud.size * 0.6,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '50%',
                }}
              />
            ))}

            {/* Ground */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: GAME_HEIGHT - GROUND_Y,
                backgroundColor: '#228B22',
              }}
            />

            {/* Dino */}
            <motion.div
              style={{
                position: 'absolute',
                left: 100,
                top: isDucking ? dinoY + 20 : dinoY,
                width: isDucking ? 60 : 40,
                height: isDucking ? 30 : 60,
              }}
              animate={{
                scaleY: isJumping ? 0.8 : 1,
                rotate: isJumping ? -10 : 0,
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#2E8B57',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}
              >
                🦕
              </div>
            </motion.div>

            {/* Obstacles */}
            {obstacles.map(obs => (
              <motion.div
                key={obs.id}
                style={{
                  position: 'absolute',
                  left: obs.x,
                  top: obs.y,
                  width: obs.width,
                  height: obs.height,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {obs.type === 'cactus' ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#228B22',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}
                  >
                    🌵
                  </div>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#FFD700',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                    }}
                  >
                    🦅
                  </div>
                )}
              </motion.div>
            ))}

            {/* Game Over Overlay */}
            <AnimatePresence>
              {gameState === 'over' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Paper
                    elevation={10}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      borderRadius: 4,
                      background: 'rgba(255, 255, 255, 0.95)',
                    }}
                  >
                    <Typography variant="h4" gutterBottom>
                      💥 Game Over!
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      Score: {score}
                    </Typography>
                    {score === highScore && score > 0 && (
                      <Typography variant="body1" color="success.main" gutterBottom>
                        🎉 New High Score! +Rp {Math.floor(score / 10)}
                      </Typography>
                    )}
                    <Box display="flex" gap={2} justifyContent="center" mt={3}>
                      <Button
                        variant="contained"
                        onClick={startGame}
                        startIcon={<RefreshIcon />}
                        sx={{
                          background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                        }}
                      >
                        Main Lagi
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={resetGame}
                      >
                        Kembali
                      </Button>
                    </Box>
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ready State */}
            {gameState === 'ready' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Paper
                  elevation={10}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  <Typography variant="h4" gutterBottom sx={{ color: '#8a2be2', fontWeight: 'bold' }}>
                    🦕 Dino Runner
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Gunakan SPACEBAR/↑ untuk lompat<br />
                    ↓ untuk bungkuk
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={startGame}
                    size="large"
                    sx={{
                      background: 'linear-gradient(45deg, #8a2be2, #00bcd4)',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  >
                    Mulai Bermain
                  </Button>
                </Paper>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Controls Info */}
      {playerName && gameState === 'playing' && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            marginTop: '16px',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Box display="flex" gap={2} justifyContent="center">
            <Chip icon={<ArrowUpwardIcon />} label="Lompat" color="primary" />
            <Chip icon={<ArrowDownwardIcon />} label="Bungkuk" color="secondary" />
            <Chip label={`Speed: ${gameSpeed.toFixed(1)}x`} color="success" />
          </Box>
        </motion.div>
      )}

      {/* Mobile Touch Controls */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={() => {
              if (!isJumping && dinoY >= GROUND_Y) {
                setDinoVelocityY(JUMP_FORCE);
                setIsJumping(true);
              }
            }}
            sx={{
              minWidth: '60px',
              minHeight: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #8a2be2, #00bcd4)',
            }}
          >
            <ArrowUpwardIcon />
          </Button>
          <Button
            variant="contained"
            onMouseDown={() => setIsDucking(true)}
            onMouseUp={() => setIsDucking(false)}
            onTouchStart={() => setIsDucking(true)}
            onTouchEnd={() => setIsDucking(false)}
            sx={{
              minWidth: '60px',
              minHeight: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #00bcd4, #8a2be2)',
            }}
          >
            <ArrowDownwardIcon />
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DinoRunner;

