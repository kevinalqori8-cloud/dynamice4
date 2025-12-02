import React, { useState, useEffect, useCallback } from 'react';
import { 
  Button, 
  Typography, 
  Box, 
  Grid, 
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import './MinesGame.css';

const DIFFICULTY = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 }
};

const MinesGame = () => {
  const [difficulty, setDifficulty] = useState('easy');
  const [board, setBoard] = useState([]);
  const [gameState, setGameState] = useState('ready'); // ready, playing, won, lost
  const [mineCount, setMineCount] = useState(0);
  const [time, setTime] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  const [firstClick, setFirstClick] = useState(true);

  const config = DIFFICULTY[difficulty];

  // Initialize empty board
  const createEmptyBoard = useCallback(() => {
    const newBoard = [];
    for (let i = 0; i < config.rows; i++) {
      newBoard[i] = [];
      for (let j = 0; j < config.cols; j++) {
        newBoard[i][j] = {
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborCount: 0
        };
      }
    }
    return newBoard;
  }, [config]);

  // Place mines randomly
  const placeMines = useCallback((board, excludeRow, excludeCol) => {
    let minesPlaced = 0;
    const newBoard = board.map(row => [...row]);

    while (minesPlaced < config.mines) {
      const row = Math.floor(Math.random() * config.rows);
      const col = Math.floor(Math.random() * config.cols);

      if (!newBoard[row][col].isMine && !(row === excludeRow && col === excludeCol)) {
        newBoard[row][col].isMine = true;
        minesPlaced++;

        // Update neighbor counts
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= 0 && newRow < config.rows && newCol >= 0 && newCol < config.cols) {
              newBoard[newRow][newCol].neighborCount++;
            }
          }
        }
      }
    }
    return newBoard;
  }, [config]);

  // Reveal cell and adjacent empty cells
  const revealCell = useCallback((board, row, col) => {
    const newBoard = board.map(row => [...row]);
    const toReveal = [[row, col]];

    while (toReveal.length > 0) {
      const [currentRow, currentCol] = toReveal.pop();
      
      if (currentRow < 0 || currentRow >= config.rows || currentCol < 0 || currentCol >= config.cols) continue;
      if (newBoard[currentRow][currentCol].isRevealed || newBoard[currentRow][currentCol].isFlagged) continue;

      newBoard[currentRow][currentCol].isRevealed = true;

      if (newBoard[currentRow][currentCol].neighborCount === 0 && !newBoard[currentRow][currentCol].isMine) {
        // Add all neighbors to reveal queue
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            toReveal.push([currentRow + dr, currentCol + dc]);
          }
        }
      }
    }

    return newBoard;
  }, [config]);

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (gameState === 'won' || gameState === 'lost') return;
    if (board[row][col].isRevealed || board[row][col].isFlagged) return;

    let newBoard = [...board];
    let newGameState = gameState;

    if (firstClick) {
      newBoard = placeMines(newBoard, row, col);
      setFirstClick(false);
      newGameState = 'playing';
      setGameState('playing');
    }

    if (newBoard[row][col].isMine) {
      // Game over
      newBoard = newBoard.map(row => row.map(cell => ({ ...cell, isRevealed: true })));
      setGameState('lost');
      newGameState = 'lost';
    } else {
      newBoard = revealCell(newBoard, row, col);
      
      // Check win condition
      const unrevealedCells = newBoard.flat().filter(cell => !cell.isRevealed).length;
      if (unrevealedCells === config.mines) {
        setGameState('won');
        newGameState = 'won';
      }
    }

    setBoard(newBoard);
  };

  // Handle right click for flagging
  const handleCellRightClick = (e, row, col) => {
    e.preventDefault();
    if (gameState === 'won' || gameState === 'lost') return;
    if (board[row][col].isRevealed) return;

    const newBoard = board.map(row => [...row]);
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    
    setBoard(newBoard);
    setFlagCount(prev => newBoard[row][col].isFlagged ? prev + 1 : prev - 1);
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // New game
  const newGame = () => {
    setBoard(createEmptyBoard());
    setGameState('ready');
    setTime(0);
    setFlagCount(0);
    setFirstClick(true);
  };

  // Initialize board on mount
  useEffect(() => {
    newGame();
  }, [difficulty]);

  const getCellContent = (cell) => {
    if (cell.isFlagged) return <FlagIcon fontSize="small" />;
    if (!cell.isRevealed) return '';
    if (cell.isMine) return '💣';
    if (cell.neighborCount === 0) return '';
    return cell.neighborCount;
  };

  const getCellClass = (cell) => {
    let className = 'mines-cell ';
    if (!cell.isRevealed) className += 'hidden ';
    if (cell.isFlagged) className += 'flagged ';
    if (cell.isRevealed && cell.isMine) className += 'mine ';
    if (cell.isRevealed && cell.neighborCount > 0) className += `number-${cell.neighborCount}`;
    return className;
  };

  return (
    <Box className="mines-game">
      <Paper elevation={3} className="mines-container">
        <Box className="mines-header">
          <Typography variant="h5" className="mines-title">
            <EmojiEventsIcon /> Mines Game
          </Typography>
          
          <Box className="mines-controls">
            <Button
              variant="outlined"
              size="small"
              onClick={newGame}
              startIcon={<RefreshIcon />}
            >
              New Game
            </Button>
            
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="difficulty-select"
            >
              <option value="easy">Easy (9x9, 10 mines)</option>
              <option value="medium">Medium (16x16, 40 mines)</option>
              <option value="hard">Hard (16x30, 99 mines)</option>
            </select>
          </Box>
        </Box>

        <Box className="mines-status">
          <Chip 
            label={`Mines: ${config.mines - flagCount}`} 
            color="error"
            variant="outlined"
          />
          <Chip 
            label={`Time: ${time}s`} 
            color="primary"
            variant="outlined"
          />
          <Chip 
            label={`Flags: ${flagCount}`} 
            color="secondary"
            variant="outlined"
          />
        </Box>

        <Box className="mines-board">
          <Grid container spacing={0} className="board-grid">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <Grid item key={`${rowIndex}-${colIndex}`}>
                  <Button
                    className={getCellClass(cell)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
                    disabled={gameState === 'won' || gameState === 'lost'}
                  >
                    {getCellContent(cell)}
                  </Button>
                </Grid>
              ))
            )}
          </Grid>
        </Box>

        <Dialog open={gameState === 'won' || gameState === 'lost'}>
          <DialogTitle>
            {gameState === 'won' ? '🎉 Congratulations!' : '💥 Game Over!'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {gameState === 'won' 
                ? `You won in ${time} seconds! Great job!`
                : 'You hit a mine! Better luck next time.'
              }
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={newGame} variant="contained" color="primary">
              Play Again
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default MinesGame;

