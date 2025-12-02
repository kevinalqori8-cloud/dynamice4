import React, { useState, useEffect, useCallback } from 'react';
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
  Grid
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [[10, 10]];
const INITIAL_FOOD = [15, 15];
const INITIAL_DIRECTION = 'RIGHT';
const GAME_SPEED = 150;

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameState, setGameState] = useState('ready'); // ready, playing, paused, over
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snakeHighScore') || '0');
  });

  // Generate random food position
  const generateFood = useCallback((currentSnake) => {
    let newFood;
    do {
      newFood = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE)
      ];
    } while (currentSnake.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1]));
    return newFood;
  }, []);

  // Move snake
  const moveSnake = useCallback(() => {
    if (gameState !== 'playing') return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = [...newSnake[0]];

      // Move head based on direction
      switch (direction) {
        case 'UP': head[0] -= 1; break;
        case 'DOWN': head[0] += 1; break;
        case 'LEFT': head[1] -= 1; break;
        case 'RIGHT': head[1] += 1; break;
      }

      // Check wall collision
      if (head[0] < 0 || head[0] >= GRID_SIZE || head[1] < 0 || head[1] >= GRID_SIZE) {
        setGameState('over');
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment[0] === head[0] && segment[1] === head[1])) {
        setGameState('over');
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head[0] === food[0] && head[1] === food[1]) {
        setScore(prev => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore.toString());
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameState, generateFood, highScore]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState === 'over' || gameState === 'ready') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          setDirection(prev => prev !== 'DOWN' ? 'UP' : prev);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          setDirection(prev => prev !== 'UP' ? 'DOWN' : prev);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setDirection(prev => prev !== 'RIGHT' ? 'LEFT' : prev);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setDirection(prev => prev !== 'LEFT' ? 'RIGHT' : prev);
          break;
        case ' ':
          e.preventDefault();
          setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      const gameInterval = setInterval(moveSnake, GAME_SPEED);
      return () => clearInterval(gameInterval);
    }
  }, [gameState, moveSnake]);

  // Start game
  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameState('playing');
  };

  // Reset game
  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameState('ready');
  };

  const getCellContent = (row, col) => {
    const isSnakeSegment = snake.some(segment => segment[0] === row && segment[1] === col);
    const isSnakeHead = snake[0][0] === row && snake[0][1] === col;
    const isFood = food[0] === row && food[1] === col;

    if (isSnakeHead) return '🐍';
    if (isSnakeSegment) return '🟢';
    if (isFood) return '🍎';
    return '';
  };

  const getCellClass = (row, col) => {
    const isSnakeSegment = snake.some(segment => segment[0] === row && segment[1] === col);
    const isSnakeHead = snake[0][0] === row && snake[0][1] === col;
    const isFood = food[0] === row && food[1] === col;

    let className = 'snake-cell ';
    if (isSnakeHead) className += 'snake-head ';
    else if (isSnakeSegment) className += 'snake-body ';
    else if (isFood) className += 'food ';
    return className;
  };

  return (
    <Box className="snake-game">
      <Paper elevation={3} className="snake-container">
        <Box className="snake-header">
          <Typography variant="h5" className="snake-title">
            <EmojiEventsIcon /> Snake Game
          </Typography>
          
          <Box className="snake-controls">
            <Button
              variant="outlined"
              size="small"
              onClick={gameState === 'playing' ? () => setGameState('paused') : startGame}
              disabled={gameState === 'over'}
            >
              {gameState === 'ready' ? 'Start' : gameState === 'playing' ? 'Pause' : 'Resume'}
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              onClick={resetGame}
              startIcon={<RefreshIcon />}
            >
              Reset
            </Button>
          </Box>
        </Box>

        <Box className="snake-status">
          <Chip label={`Score: ${score}`} color="primary" variant="outlined" />
          <Chip label={`High Score: ${highScore}`} color="secondary" variant="outlined" />
          <Chip 
            label={`Status: ${gameState === 'playing' ? 'Playing' : gameState === 'paused' ? 'Paused' : gameState === 'over' ? 'Game Over' : 'Ready'}`} 
            color={gameState === 'playing' ? 'success' : 'default'}
            variant="outlined" 
          />
        </Box>

        {gameState === 'ready' && (
          <Box className="game-instructions">
            <Typography variant="body1" align="center" sx={{ mb: 2 }}>
              Use arrow keys or WASD to control the snake. Eat the apples to grow and score points!
            </Typography>
          </Box>
        )}

        <Box className="snake-board">
          <Grid container spacing={0} className="board-grid">
            {Array.from({ length: GRID_SIZE }, (_, row) =>
              Array.from({ length: GRID_SIZE }, (_, col) => (
                <Grid item key={`${row}-${col}`}>
                  <Box className={getCellClass(row, col)}>
                    {getCellContent(row, col)}
                  </Box>
                </Grid>
              ))
            )}
          </Grid>
        </Box>

        <Dialog open={gameState === 'over'}>
          <DialogTitle>🐍 Game Over!</DialogTitle>
          <DialogContent>
            <Typography>
              Your score: {score}
              {score === highScore && score > 0 && (
                <Box component="span" sx={{ color: 'success.main', fontWeight: 'bold', ml: 1 }}>
                  - New High Score! 🎉
                </Box>
              )}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetGame} variant="contained" color="primary">
              Play Again
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default SnakeGame;

