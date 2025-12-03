import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

// Block shapes (Tetris-like)
const BLOCK_SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[1, 1, 1], [0, 1, 0]],
  L: [[1, 0, 0], [1, 1, 1]],
  J: [[0, 0, 1], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  DOT: [[1]]
};

const BLOCK_COLORS = {
  1: 'bg-red-500',
  2: 'bg-blue-500',
  3: 'bg-green-500',
  4: 'bg-yellow-500',
  5: 'bg-purple-500',
  6: 'bg-orange-500',
  7: 'bg-pink-500',
  8: 'bg-cyan-500'
};

const GRID_SIZE = 8;

const BlockBlast = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  
  // Game states
  const [gameState, setGameState] = useState('ready'); // ready, playing, over
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)));
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [combo, setCombo] = useState(0);

  const { data: userData } = useUserData(playerName || "guest");
  const money = userData?.money || 0;

  // Initialize
  useEffect(() => {
    const savedName = localStorage.getItem('blockblast_player_name');
    if (savedName) {
      setPlayerName(savedName);
      setShowNameInput(false);
    } else {
      setShowNameInput(true);
    }
    
    const savedHighScore = parseInt(localStorage.getItem('blockblast_high_score') || '0');
    setHighScore(savedHighScore);
  }, []);

  const savePlayerName = async (name) => {
    if (!name.trim()) return;
    setPlayerName(name.trim());
    localStorage.setItem('blockblast_player_name', name.trim());
    setShowNameInput(false);
    
    await userService.saveUserData(name.trim(), {
      nama: name.trim(),
      money: money || 1000,
      achievements: []
    });
  };

  // Generate random blocks
  const generateBlocks = useCallback(() => {
    const shapes = Object.keys(BLOCK_SHAPES);
    const newBlocks = [];
    
    for (let i = 0; i < 3; i++) {
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      const rotatedShape = rotateBlock(BLOCK_SHAPES[randomShape], Math.floor(Math.random() * 4));
      
      newBlocks.push({
        id: Date.now() + i,
        shape: rotatedShape,
        color: Math.floor(Math.random() * 8) + 1,
        placed: false
      });
    }
    
    return newBlocks;
  }, []);

  // Rotate block matrix
  const rotateBlock = (block, times) => {
    let rotated = block.map(row => [...row]);
    
    for (let i = 0; i < times; i++) {
      const rows = rotated.length;
      const cols = rotated[0].length;
      const newRotated = Array(cols).fill().map(() => Array(rows).fill(0));
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          newRotated[c][rows - 1 - r] = rotated[r][c];
        }
      }
      
      rotated = newRotated;
    }
    
    return rotated;
  };

  // Check if block can be placed
  const canPlaceBlock = useCallback((block, startRow, startCol) => {
    if (!block || startRow < 0 || startCol < 0) return false;
    
    const blockRows = block.length;
    const blockCols = block[0].length;
    
    if (startRow + blockRows > GRID_SIZE || startCol + blockCols > GRID_SIZE) return false;
    
    for (let r = 0; r < blockRows; r++) {
      for (let c = 0; c < blockCols; c++) {
        if (block[r][c] === 1 && grid[startRow + r][startCol + c] !== 0) {
          return false;
        }
      }
    }
    
    return true;
  }, [grid]);

  // Place block on grid
  const placeBlock = useCallback((block, startRow, startCol, color) => {
    const newGrid = grid.map(row => [...row]);
    const blockRows = block.length;
    const blockCols = block[0].length;
    
    for (let r = 0; r < blockRows; r++) {
      for (let c = 0; c < blockCols; c++) {
        if (block[r][c] === 1) {
          newGrid[startRow + r][startCol + c] = color;
        }
      }
    }
    
    return newGrid;
  }, [grid]);

  // Clear completed lines
  const clearLines = useCallback((newGrid) => {
    let linesCleared = 0;
    let clearedGrid = newGrid.map(row => [...row]);
    
    // Check rows
    for (let r = 0; r < GRID_SIZE; r++) {
      if (clearedGrid[r].every(cell => cell !== 0)) {
        clearedGrid[r] = Array(GRID_SIZE).fill(0);
        linesCleared++;
      }
    }
    
    // Check columns
    for (let c = 0; c < GRID_SIZE; c++) {
      if (clearedGrid.every(row => row[c] !== 0)) {
        for (let r = 0; r < GRID_SIZE; r++) {
          clearedGrid[r][c] = 0;
        }
        linesCleared++;
      }
    }
    
    // Calculate score
    if (linesCleared > 0) {
      const baseScore = linesCleared * 100;
      const comboBonus = combo * 50;
      const newScore = score + baseScore + comboBonus + (linesCleared * level * 10);
      
      setScore(newScore);
      setCombo(prev => prev + linesCleared);
      
      // Level up every 1000 points
      const newLevel = Math.floor(newScore / 1000) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
      }
      
      // Reward money
      if (playerName) {
        const reward = linesCleared * 10 * level;
        userService.updateMoney(playerName, money + reward);
      }
    } else {
      setCombo(0);
    }
    
    return { grid: clearedGrid, linesCleared };
  }, [score, combo, level, playerName, money]);

  // Handle block placement
  const handleGridClick = useCallback((row, col) => {
    if (!selectedBlock || gameState !== 'playing') return;
    
    if (canPlaceBlock(selectedBlock.shape, row, col)) {
      const newGrid = placeBlock(selectedBlock.shape, row, col, selectedBlock.color);
      const result = clearLines(newGrid);
      
      setGrid(result.grid);
      
      // Remove placed block
      setAvailableBlocks(prev => 
        prev.map(block => 
          block.id === selectedBlock.id 
            ? { ...block, placed: true }
            : block
        )
      );
      
      setSelectedBlock(null);
      
      // Generate new blocks when all are placed
      const activeBlocks = availableBlocks.filter(b => !b.placed && b.id !== selectedBlock.id);
      if (activeBlocks.length === 0) {
        setTimeout(() => {
          setAvailableBlocks(generateBlocks());
        }, 300);
      }
    }
  }, [selectedBlock, gameState, canPlaceBlock, placeBlock, clearLines, availableBlocks, generateBlocks]);

  // Check game over
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const hasValidMoves = availableBlocks.some(block => {
      if (block.placed) return false;
      
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (canPlaceBlock(block.shape, r, c)) {
            return true;
          }
        }
      }
      return false;
    });
    
    if (!hasValidMoves && availableBlocks.every(b => b.placed)) {
      setGameState('over');
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('blockblast_high_score', score.toString());
      }
    }
  }, [availableBlocks, gameState, canPlaceBlock, score, highScore]);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setCombo(0);
    setGrid(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)));
    setAvailableBlocks(generateBlocks());
    setSelectedBlock(null);
  };

  const resetGame = () => {
    setGameState('ready');
    setScore(0);
    setLevel(1);
    setCombo(0);
    setGrid(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)));
    setAvailableBlocks([]);
    setSelectedBlock(null);
  };

  // Render block preview
  const renderBlock = (block, size = 'md') => {
    const cellSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
    
    return (
      <div className="inline-block">
        {block.map((row, rIndex) => (
          <div key={rIndex} className="flex">
            {row.map((cell, cIndex) => (
              <div
                key={cIndex}
                className={`${cellSize} border border-gray-300 ${cell ? BLOCK_COLORS[block.color] || 'bg-gray-400' : 'bg-transparent'}`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4">
      
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
                🧩 Block Blast
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
                className="bg-gradient-to-r from-purple-500 to-pink-500"
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
            <Typography variant="h4" className="font-bold">🧩 Block Blast</Typography>
            <Typography variant="body1">Score: {score} | High: {highScore} | Level: {level}</Typography>
          </div>
          <div className="text-right">
            <Typography variant="body1">Player: {playerName}</Typography>
            <Typography variant="body1">Money: Rp {money.toLocaleString()}</Typography>
          </div>
        </motion.div>
      )}

      {/* Game Area */}
      {playerName && (
        <div className="flex gap-8 items-start">
          {/* Main Grid */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/90 rounded-2xl p-4 shadow-2xl"
          >
            <div className="grid grid-cols-8 gap-1 p-4 bg-gray-100 rounded-xl">
              {grid.map((row, rIndex) => 
                row.map((cell, cIndex) => (
                  <motion.div
                    key={`${rIndex}-${cIndex}`}
                    className={`w-12 h-12 border border-gray-300 rounded cursor-pointer transition-all ${
                      cell !== 0 ? BLOCK_COLORS[cell] : 'bg-white hover:bg-gray-50'
                    } ${selectedBlock && canPlaceBlock(selectedBlock.shape, rIndex, cIndex) ? 'ring-2 ring-green-400' : ''}`}
                    onClick={() => handleGridClick(rIndex, cIndex)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {cell !== 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-full h-full flex items-center justify-center text-white font-bold"
                      >
                        ●
                      </motion.div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Available Blocks */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white/90 rounded-2xl p-4 shadow-2xl"
          >
            <Typography variant="h6" className="mb-4 text-center">Available Blocks</Typography>
            <div className="space-y-4">
              {availableBlocks.map((block) => (
                <motion.div
                  key={block.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedBlock?.id === block.id
                      ? 'border-purple-500 bg-purple-50'
                      : block.placed
                      ? 'border-gray-300 bg-gray-100 opacity-50'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => !block.placed && setSelectedBlock(block)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex justify-center mb-2">
                    {renderBlock(block)}
                  </div>
                  <Typography variant="caption" className="text-center block">
                    {block.placed ? 'Used' : 'Click to select'}
                  </Typography>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameState === 'over' && (
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
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center"
            >
              <Typography variant="h4" className="mb-4">🧩 Game Over!</Typography>
              <Typography variant="h6" className="mb-2">Final Score: {score}</Typography>
              <Typography variant="body1" className="mb-2">Level Reached: {level}</Typography>
              {score === highScore && score > 0 && (
                <Typography variant="body1" className="text-purple-600 mb-4">
                  🎉 New High Score!
                </Typography>
              )}
              <div className="flex gap-4 justify-center">
                <Button
                  variant="contained"
                  onClick={startGame}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ready State */}
      {playerName && gameState === 'ready' && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/90 rounded-2xl p-8 text-center shadow-2xl"
        >
          <Typography variant="h4" className="mb-4">🧩 Block Blast</Typography>
          <Typography variant="body1" className="mb-6">
            Letakkan blok di grid untuk menghapus baris dan kolom!<br/>
            Semakin banyak baris yang dihapus, semakin tinggi skor!
          </Typography>
          <Button
            variant="contained"
            onClick={startGame}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            Mulai Bermain
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default BlockBlast;

