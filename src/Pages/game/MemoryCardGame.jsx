import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Typography, Box, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../../hooks/useFirebaseData';
import { userService } from '../../service/firebaseService';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimerIcon from '@mui/icons-material/Timer';

// 🎮 Memory Card Game - Tema Kelas XE-4
const MemoryCardGame = () => {
  const navigate = useNavigate();
  const { userData } = useUserData();
  
  // Game States
  const [gameState, setGameState] = useState('menu'); // menu, playing, completed, failed
  const [difficulty, setDifficulty] = useState('easy'); // easy, medium, hard
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);
  const [showVictory, setShowVictory] = useState(false);

  // Card themes - Karakter kelas XE-4
  const cardThemes = {
    easy: [
      { id: 'valiant', name: 'Valiant', emoji: '🦸‍♂️', color: 'from-red-400 to-red-600' },
      { id: 'lulu', name: 'Lulu', emoji: '🌸', color: 'from-pink-400 to-pink-600' },
      { id: 'naviza', name: 'Naviza', emoji: '📚', color: 'from-blue-400 to-blue-600' },
      { id: 'rhenata', name: 'Rhenata', emoji: '🎨', color: 'from-purple-400 to-purple-600' },
      { id: 'keysa', name: 'Keysa', emoji: '💰', color: 'from-green-400 to-green-600' },
      { id: 'husna', name: 'Husna', emoji: '🌙', color: 'from-indigo-400 to-indigo-600' },
    ],
    medium: [
      { id: 'tegar', name: 'Tegar', emoji: '🛡️', color: 'from-gray-400 to-gray-600' },
      { id: 'azam', name: 'Azam', emoji: '⚔️', color: 'from-red-500 to-red-700' },
      { id: 'kevinn', name: 'Kevinn', emoji: '🧹', color: 'from-green-500 to-green-700' },
      { id: 'lelita', name: 'Lelita', emoji: '🌺', color: 'from-pink-500 to-pink-700' },
      { id: 'rakha', name: 'Rakha', emoji: '💊', color: 'from-blue-500 to-blue-700' },
      { id: 'nayla', name: 'Nayla', emoji: '🌿', color: 'from-emerald-500 to-emerald-700' },
      { id: 'dini', name: 'Dini', emoji: '🕌', color: 'from-amber-500 to-amber-700' },
      { id: 'hakan', name: 'Hakan', emoji: '🙏', color: 'from-orange-500 to-orange-700' },
    ],
    hard: [
      { id: 'syafiera', name: 'Syafiera', emoji: '📖', color: 'from-yellow-400 to-yellow-600' },
      { id: 'keyzia', name: 'Keyzia', emoji: '🔧', color: 'from-gray-500 to-gray-700' },
      { id: 'ahnaf', name: 'Ahnaf', emoji: '🎭', color: 'from-purple-500 to-purple-700' },
      { id: 'avisa', name: 'Avisa', emoji: '🎪', color: 'from-red-600 to-red-800' },
      { id: 'hafizh', name: 'Hafizh', emoji: '✂️', color: 'from-teal-500 to-teal-700' },
      { id: 'nirbita', name: 'Nirbita', emoji: '📰', color: 'from-blue-600 to-blue-800' },
      { id: 'maritza', name: 'Maritza', emoji: '🎨', color: 'from-pink-600 to-pink-800' },
      { id: 'aulia', name: 'Aulia', emoji: '🎵', color: 'from-indigo-600 to-indigo-800' },
      { id: 'sevisalya', name: 'Sevisalya', emoji: '📋', color: 'from-green-600 to-green-800' },
      { id: 'kepinn', name: 'Kepinn', emoji: '👑', color: 'from-yellow-500 to-yellow-700' },
    ]
  };

  // Game settings berdasarkan difficulty
  const gameSettings = {
    easy: { pairs: 6, gridCols: 4, timeLimit: 180 },
    medium: { pairs: 8, gridCols: 4, timeLimit: 240 },
    hard: { pairs: 10, gridCols: 5, timeLimit: 300 }
  };

  // Initialize game
  const initializeGame = useCallback((selectedDifficulty) => {
    const settings = gameSettings[selectedDifficulty];
    const themes = cardThemes[selectedDifficulty];
    const selectedThemes = themes.slice(0, settings.pairs);
    
    // Create card pairs
    const gameCards = [];
    selectedThemes.forEach((theme, index) => {
      gameCards.push(
        { id: `${theme.id}_1`, theme, pairId: theme.id, uniqueId: index * 2 },
        { id: `${theme.id}_2`, theme, pairId: theme.id, uniqueId: index * 2 + 1 }
      );
    });
    
    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setDifficulty(selectedDifficulty);
    setGameState('playing');
    setMoves(0);
    setTime(0);
    setScore(0);
    setFlippedCards([]);
    setMatchedCards([]);
    setShowVictory(false);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTime(prev => {
          const newTime = prev + 1;
          const settings = gameSettings[difficulty];
          if (newTime >= settings.timeLimit) {
            setGameState('failed');
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, difficulty]);

  // Check for victory
  useEffect(() => {
    if (matchedCards.length > 0 && matchedCards.length === cards.length && cards.length > 0) {
      setGameState('completed');
      setShowVictory(true);
      calculateScore();
    }
  }, [matchedCards, cards]);

  // Handle card flip
  const handleCardFlip = (cardId) => {
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(cardId)) return;
    if (matchedCards.includes(cardId)) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard.pairId === secondCard.pairId) {
        // Match found
        setTimeout(() => {
          setMatchedCards(prev => [...prev, firstId, secondId]);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Calculate score
  const calculateScore = () => {
    const settings = gameSettings[difficulty];
    const baseScore = 1000;
    const timeBonus = Math.max(0, (settings.timeLimit - time) * 2);
    const moveBonus = Math.max(0, (settings.pairs * 2 - moves) * 10);
    const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 };
    
    const finalScore = Math.floor((baseScore + timeBonus + moveBonus) * difficultyMultiplier[difficulty]);
    setScore(finalScore);

    // Save to leaderboard
    if (userData?.uid) {
      userService.addScore(userData.uid, 'memory', finalScore);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset game
  const resetGame = () => {
    setGameState('menu');
    setShowVictory(false);
  };

  // Render menu
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              🧠 Memory Card Game
            </motion.h1>
            <p className="text-xl text-gray-300">Tes ingatanmu dengan karakter kelas XE-4!</p>
          </div>

          {/* Game Stats */}
          {userData && (
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 mb-8">
              <Typography variant="h6" className="mb-4 text-center">📊 Statistik Kamu</Typography>
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <div className="text-center">
                    <Typography variant="h4" className="text-purple-400">{userData.gameStats?.memory?.gamesPlayed || 0}</Typography>
                    <Typography variant="body2" className="text-gray-400">Games Played</Typography>
                  </div>
                </Grid>
                <Grid item xs={4}>
                  <div className="text-center">
                    <Typography variant="h4" className="text-blue-400">{userData.gameStats?.memory?.highScore || 0}</Typography>
                    <Typography variant="body2" className="text-gray-400">High Score</Typography>
                  </div>
                </Grid>
                <Grid item xs={4}>
                  <div className="text-center">
                    <Typography variant="h4" className="text-green-400">{userData.gameStats?.memory?.bestTime || '--'}</Typography>
                    <Typography variant="body2" className="text-gray-400">Best Time</Typography>
                  </div>
                </Grid>
              </Grid>
            </div>
          )}

          {/* Difficulty Selection */}
          <div className="grid md:grid-cols-3 gap-6">
            {['easy', 'medium', 'hard'].map((diff) => {
              const settings = gameSettings[diff];
              const themes = cardThemes[diff];
              
              return (
                <motion.div
                  key={diff}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Paper 
                    className="bg-black/30 backdrop-blur-lg p-6 cursor-pointer hover:bg-black/50 transition-all duration-300 h-full"
                    onClick={() => initializeGame(diff)}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-4">
                        {diff === 'easy' && '🟢'}
                        {diff === 'medium' && '🟡'}
                        {diff === 'hard' && '🔴'}
                      </div>
                      <Typography variant="h5" className="mb-2 capitalize text-white">
                        {diff === 'easy' && 'Mudah'}
                        {diff === 'medium' && 'Sedang'}
                        {diff === 'hard' && 'Sulit'}
                      </Typography>
                      <div className="space-y-2 text-gray-300">
                        <p>• {settings.pairs} pasang kartu</p>
                        <p>• Batas waktu: {settings.timeLimit/60} menit</p>
                        <p>• Karakter: {themes.length} siswa</p>
                      </div>
                      <Chip 
                        label={`${settings.pairs * 2} Cards`} 
                        className="mt-4"
                        color={diff === 'easy' ? 'success' : diff === 'medium' ? 'warning' : 'error'}
                      />
                    </div>
                  </Paper>
                </motion.div>
              );
            })}
          </div>

          {/* Back Button */}
          <div className="text-center mt-8">
            <Button
              variant="outlined"
              onClick={() => navigate('/game')}
              className="text-white border-white hover:bg-white hover:text-purple-900"
            >
              ← Kembali ke Games
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render game
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Game Header */}
        <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outlined"
                onClick={resetGame}
                className="text-white border-white hover:bg-white hover:text-purple-900"
                startIcon={<RefreshIcon />}
              >
                Menu
              </Button>
              <Typography variant="h6" className="text-white capitalize">
                {difficulty} Mode
              </Typography>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <TimerIcon className="text-blue-400" />
                <Typography className="text-white">
                  {formatTime(time)} / {formatTime(gameSettings[difficulty].timeLimit)}
                </Typography>
              </div>
              
              <div className="flex items-center gap-2">
                <EmojiEventsIcon className="text-yellow-400" />
                <Typography className="text-white">
                  {moves} Moves
                </Typography>
              </div>
              
              <Chip 
                label={`${matchedCards.length/2}/${gameSettings[difficulty].pairs} Matches`} 
                color="success"
              />
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6">
          <Grid 
            container 
            spacing={2} 
            justifyContent="center"
            style={{ 
              gridTemplateColumns: `repeat(${gameSettings[difficulty].gridCols}, 1fr)`,
              display: 'grid'
            }}
          >
            {cards.map((card) => {
              const isFlipped = flippedCards.includes(card.id) || matchedCards.includes(card.id);
              const isMatched = matchedCards.includes(card.id);
              
              return (
                <Grid item key={card.id}>
                  <motion.div
                    whileHover={{ scale: isMatched ? 1 : 1.05 }}
                    whileTap={{ scale: isMatched ? 1 : 0.95 }}
                  >
                    <Card
                      className={`
                        w-20 h-20 md:w-24 md:h-24 cursor-pointer
                        ${isMatched ? 'opacity-60' : ''}
                        transition-all duration-300
                      `}
                      onClick={() => handleCardFlip(card.id)}
                      style={{
                        background: isFlipped 
                          ? `linear-gradient(135deg, ${card.theme.color})`
                          : 'linear-gradient(135deg, #374151, #1f2937)',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      <CardContent className="flex items-center justify-center h-full p-2">
                        <div className="text-center">
                          <div className="text-2xl md:text-3xl mb-1">
                            {isFlipped ? card.theme.emoji : '🎴'}
                          </div>
                          {isFlipped && (
                            <Typography variant="caption" className="text-white text-xs">
                              {card.theme.name}
                            </Typography>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="bg-black/30 backdrop-blur-lg rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(matchedCards.length / cards.length) * 100}%` 
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Victory Dialog */}
      <Dialog open={showVictory} onClose={() => setShowVictory(false)} maxWidth="sm" fullWidth>
        <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <DialogTitle className="text-white text-center">
            <div className="text-6xl mb-4">🎉</div>
            <Typography variant="h4" className="font-bold">
              Selamat!
            </Typography>
          </DialogTitle>
          <DialogContent className="text-white">
            <div className="text-center space-y-4">
              <Typography variant="h6">
                Kamu berhasil menyelesaikan game!
              </Typography>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-black/30 rounded-lg p-4">
                  <Typography variant="h5" className="text-purple-400">{score}</Typography>
                  <Typography variant="body2" className="text-gray-400">Total Score</Typography>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <Typography variant="h5" className="text-blue-400">{formatTime(time)}</Typography>
                  <Typography variant="body2" className="text-gray-400">Waktu</Typography>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <Typography variant="h5" className="text-green-400">{moves}</Typography>
                  <Typography variant="body2" className="text-gray-400">Moves</Typography>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <Typography variant="h5" className="text-yellow-400">
                    {Math.floor((gameSettings[difficulty].pairs * 2 / moves) * 100)}%
                  </Typography>
                  <Typography variant="body2" className="text-gray-400">Accuracy</Typography>
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions className="justify-center pb-6">
            <Button 
              onClick={resetGame}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              startIcon={<RefreshIcon />}
            >
              Main Lagi
            </Button>
            <Button 
              onClick={() => navigate('/game')}
              className="text-white border-white hover:bg-white hover:text-purple-900"
            >
              Lainnya Games
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );
};

export default MemoryCardGame;
