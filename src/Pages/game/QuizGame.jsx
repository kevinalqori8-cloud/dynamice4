// src/Pages/game/QuizGame.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Trophy, Zap, Brain, Lightbulb, Star, Clock, Target } from 'lucide-react';
import './styles/QuizGame.css';

const QuizGame = () => {
  const [gameState, setGameState] = useState({
    status: 'menu', // menu, playing, paused, gameOver
    score: 0,
    level: 1,
    combo: 0,
    currentQuestion: 0,
    questions: [],
    answered: false,
    selectedAnswer: null,
    correctAnswer: null,
    timeLeft: 30,
    powerUps: [],
    rainbowMode: false,
    rainbowTimer: 0,
    playerName: '',
    category: 'general',
    difficulty: 'normal'
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [volume, setVolume] = useState(0.7);

  // Quiz themes dengan animasi dan efek visual
  const QUIZ_THEMES = {
    rainbow: {
      name: '🌈 Rainbow Quiz',
      colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
      special: 'rainbow-questions'
    },
    neon: {
      name: '⚡ Neon Quiz',
      colors: ['#00FFFF', '#FF00FF', '#FFFF00'],
      special: 'glow-effect'
    },
    galaxy: {
      name: '🌌 Galaxy Quiz',
      colors: ['#9D4EDD', '#C77DFF', '#E0AAFF'],
      special: 'star-questions'
    },
    brain: {
      name: '🧠 Brain Quiz',
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      special: 'brain-boost'
    }
  };

  // Quiz categories dengan animasi dan efek
  const QUIZ_CATEGORIES = {
    general: {
      name: '🌍 Umum',
      icon: '🌍',
      color: '#4ECDC4',
      questions: [
        {
          question: "Apa ibu kota Indonesia?",
          answers: ["Jakarta", "Surabaya", "Bandung", "Medan"],
          correct: 0
        },
        {
          question: "Berapa jumlah provinsi di Indonesia?",
          answers: ["34", "33", "35", "32"],
          correct: 0
        },
        {
          question: "Siapa presiden Indonesia pertama?",
          answers: ["Soekarno", "Soeharto", "Habibie", "Megawati"],
          correct: 0
        }
      ]
    },
    science: {
      name: '🔬 Sains',
      icon: '🔬',
      color: '#9D4EDD',
      questions: [
        {
          question: "Apakah rumus kimia untuk air?",
          answers: ["H2O", "CO2", "NaCl", "O2"],
          correct: 0
        },
        {
          question: "Planet terbesar di tata surya?",
          answers: ["Jupiter", "Saturnus", "Bumi", "Mars"],
          correct: 0
        },
        {
          question: "Berapa banyak tulang di tubuh manusia dewasa?",
          answers: ["206", "205", "207", "204"],
          correct: 0
        }
      ]
    },
    math: {
      name: '🧮 Matematika',
      icon: '🧮',
      color: '#FFD700',
      questions: [
        {
          question: "Berapa hasil dari 8 × 7?",
          answers: ["56", "54", "58", "52"],
          correct: 0
        },
        {
          question: "Apakah akar kuadrat dari 144?",
          answers: ["12", "11", "13", "14"],
          correct: 0
        },
        {
          question: "Berapa sudut dalam segitiga?",
          answers: ["180°", "90°", "360°", "270°"],
          correct: 0
        }
      ]
    },
    history: {
      name: '📜 Sejarah',
      icon: '📜',
      color: '#FF6B6B',
      questions: [
        {
          question: "Kapan Indonesia merdeka?",
          answers: ["17 Agustus 1945", "1 Juni 1945", "28 Oktober 1928", "20 Mei 1908"],
          correct: 0
        },
        {
          question: "Siapa penulis lagu Indonesia Raya?",
          answers: ["W.R. Supratman", "Soekarno", "Hatta", "Agus Salim"],
          correct: 0
        },
        {
          question: "Kapan PD II berakhir?",
          answers: ["1945", "1944", "1946", "1943"],
          correct: 0
        }
      ]
    },
    geography: {
      name: '🗺️ Geografi',
      icon: '🗺️',
      color: '#45B7D1',
      questions: [
        {
          question: "Apa gunung tertinggi di Indonesia?",
          answers: ["Puncak Jaya", "Semeru", "Bromo", "Merapi"],
          correct: 0
        },
        {
          question: "Apa sungai terpanjang di Indonesia?",
          answers: ["Sungai Kapuas", "Sungai Musi", "Sungai Mahakam", "Sungai Barito"],
          correct: 0
        },
        {
          question: "Kepulauan terbesar di Indonesia?",
          answers: ["Kepulauan Maluku", "Kepulauan Sunda", "Kepulauan Raja Ampat", "Kepulauan Nusa Tenggara"],
          correct: 0
        }
      ]
    },
    technology: {
      name: '💻 Teknologi',
      icon: '💻',
      color: '#96CEB4',
      questions: [
        {
          question: "Apa kepanjangan dari 'WWW'?",
          answers: ["World Wide Web", "World Wide Network", "Web Wide World", "World Web Network"],
          correct: 0
        },
        {
          question: "Siapa penemu telepon?",
          answers: ["Alexander Graham Bell", "Thomas Edison", "Nikola Tesla", "Albert Einstein"],
          correct: 0
        },
        {
          question: "Apa nama satelit pertama Indonesia?",
          answers: ["Palapa", "Lapan", "Indostar", "Telkom"],
          correct: 0
        }
      ]
    }
  };

  // Power-ups untuk quiz
  const POWER_UPS = {
    fifty: {
      name: '50:50',
      effect: 'remove-two-wrong',
      color: '#FFD700'
    },
    skip: {
      name: '⏭️ Skip',
      effect: 'skip-question',
      color: '#00FFFF'
    },
    time: {
      name: '⏰ Extra Time',
      effect: 'add-30-seconds',
      color: '#FF00FF'
    },
    hint: {
      name: '💡 Hint',
      effect: 'show-hint',
      color: '#4ECDC4'
    }
  };

  // Difficulty levels
  const DIFFICULTY_LEVELS = {
    easy: {
      name: 'Mudah 😊',
      timeLimit: 45,
      pointsMultiplier: 1,
      wrongAnswerPenalty: 0
    },
    normal: {
      name: 'Normal 😐',
      timeLimit: 30,
      pointsMultiplier: 1.5,
      wrongAnswerPenalty: 5
    },
    hard: {
      name: 'Sulit 😈',
      timeLimit: 15,
      pointsMultiplier: 2,
      wrongAnswerPenalty: 10
    }
  };

  // Initialize game dengan animasi dan efek visual
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    setGameState({
      status: 'menu',
      score: 0,
      level: 1,
      combo: 0,
      currentQuestion: 0,
      questions: [],
      answered: false,
      selectedAnswer: null,
      correctAnswer: null,
      timeLeft: 30,
      powerUps: [],
      rainbowMode: false,
      rainbowTimer: 0,
      playerName: '',
      category: 'general',
      difficulty: 'normal'
    });
  };

  // Generate questions dengan animasi dan randomization
  const generateQuestions = useCallback((category, count = 10) => {
    const categoryData = QUIZ_CATEGORIES[category];
    const questions = [...categoryData.questions];
    
    // Shuffle questions
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    
    // Take only requested count
    return questions.slice(0, count);
  }, []);

  // Start game dengan name input
  const startGame = () => {
    if (!gameState.playerName.trim()) {
      setShowNameInput(true);
      return;
    }
    
    const questions = generateQuestions(gameState.category, 10);
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      questions: questions,
      timeLeft: DIFFICULTY_LEVELS[gameState.difficulty].timeLimit
    }));
    
    playSound('start');
    startTimer();
  };

  const submitName = (name) => {
    setGameState(prev => ({ ...prev, playerName: name }));
    setShowNameInput(false);
    
    const questions = generateQuestions(gameState.category, 10);
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      questions: questions,
      timeLeft: DIFFICULTY_LEVELS[gameState.difficulty].timeLimit
    }));
    
    playSound('start');
    startTimer();
  };

  // Timer system
  const startTimer = () => {
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          handleTimeout();
          return prev;
        }
        
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  };

  // Handle timeout
  const handleTimeout = () => {
    setGameState(prev => ({
      ...prev,
      answered: true,
      selectedAnswer: -1,
      correctAnswer: prev.questions[prev.currentQuestion].correct
    }));
    
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  // Answer selection dengan animasi dan efek visual
  const selectAnswer = (answerIndex) => {
    if (gameState.answered) return;
    
    const currentQuestion = gameState.questions[gameState.currentQuestion];
    const isCorrect = answerIndex === currentQuestion.correct;
    const difficulty = DIFFICULTY_LEVELS[gameState.difficulty];
    
    setGameState(prev => ({
      ...prev,
      answered: true,
      selectedAnswer: answerIndex,
      correctAnswer: currentQuestion.correct
    }));
    
    if (isCorrect) {
      const basePoints = 100;
      const timeBonus = Math.floor((gameState.timeLeft / difficulty.timeLimit) * 50);
      const comboBonus = prev.combo * 10;
      const totalPoints = Math.floor((basePoints + timeBonus + comboBonus) * difficulty.pointsMultiplier);
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + totalPoints,
        combo: prev.combo + 1
      }));
      
      createParticles(400, 300, '#4CAF50', 20);
      playSound('correct');
    } else {
      setGameState(prev => ({
        ...prev,
        score: Math.max(0, prev.score - difficulty.wrongAnswerPenalty),
        combo: 0
      }));
      
      createParticles(400, 300, '#F44336', 15);
      playSound('wrong');
    }
    
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  // Next question dengan animasi transisi
  const nextQuestion = () => {
    if (gameState.currentQuestion >= gameState.questions.length - 1) {
      // Game over
      setGameState(prev => ({ ...prev, status: 'gameOver' }));
      playSound('gameOver');
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      currentQuestion: prev.currentQuestion + 1,
      answered: false,
      selectedAnswer: null,
      correctAnswer: null,
      timeLeft: DIFFICULTY_LEVELS[prev.difficulty].timeLimit
    }));
  };

  // Power-up activation
  const activatePowerUp = (powerUpType) => {
    const powerUp = POWER_UPS[powerUpType];
    
    setGameState(prev => ({
      ...prev,
      powerUps: prev.powerUps.filter(p => p !== powerUpType)
    }));
    
    switch(powerUp.effect) {
      case 'remove-two-wrong':
        // Remove two wrong answers
        break;
      case 'skip-question':
        nextQuestion();
        break;
      case 'add-30-seconds':
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft + 30 }));
        break;
      case 'show-hint':
        // Show hint
        break;
    }
    
    createParticles(400, 300, powerUp.color, 15);
    playSound('powerUp');
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
        type: 'quiz-effect'
      });
    }
    
    setGameState(prev => ({
      ...prev,
      particles: [...prev.particles, ...particles]
    }));
  };

  // Sound system
  const playSound = (soundType) => {
    const sounds = {
      start: '/sounds/quiz-start.mp3',
      correct: '/sounds/correct-answer.mp3',
      wrong: '/sounds/wrong-answer.mp3',
      powerUp: '/sounds/power-up.mp3',
      gameOver: '/sounds/quiz-over.mp3'
    };

    const audio = new Audio(sounds[soundType]);
    audio.volume = volume;
    audio.play().catch(() => {});
  };

  // Category selection
  const selectCategory = (category) => {
    setGameState(prev => ({ ...prev, category }));
  };

  // Difficulty selection
  const selectDifficulty = (difficulty) => {
    setGameState(prev => ({ ...prev, difficulty }));
  };

  // Main UI dengan animasi lucu dan tema rainbow
  return (
    <div className="quiz-game-container">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="quiz-pattern"></div>
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="floating-brain"
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
            {['🧠', '💡', '🎯', '🌈', '⭐'][i % 5]}
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
              background: 'linear-gradient(45deg, #9D4EDD, #C77DFF, #E0AAFF, #FFD700)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            🧠 Rainbow Quiz Challenge
          </motion.h1>
          
          <div className="category-selection">
            <span>Kategori: </span>
            <select 
              value={gameState.category} 
              onChange={(e) => selectCategory(e.target.value)}
              className="category-select"
              disabled={gameState.status === 'playing'}
            >
              {Object.entries(QUIZ_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>{category.name}</option>
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
          
          <div className="question-counter">
            <span>{gameState.currentQuestion + 1} / {gameState.questions.length}</span>
            <div className="progress-bar">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${((gameState.currentQuestion + 1) / gameState.questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
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

      {/* Difficulty Selection */}
      {gameState.status === 'menu' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="difficulty-selection"
        >
          <h3>Pilih Kesulitan</h3>
          <div className="difficulty-options">
            {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectDifficulty(key)}
                className={`difficulty-btn ${gameState.difficulty === key ? 'selected' : ''}`}
                style={{ borderColor: level.name.includes('Mudah') ? '#4CAF50' : 
                               level.name.includes('Normal') ? '#FF9800' : '#F44336' }}
              >
                <div className="difficulty-icon">
                  {key === 'easy' ? '😊' : key === 'normal' ? '😐' : '😈'}
                </div>
                <div className="difficulty-info">
                  <div className="difficulty-name">{level.name}</div>
                  <div className="difficulty-time">⏰ {level.timeLimit} detik</div>
                  <div className="difficulty-multiplier">💰 x{level.pointsMultiplier}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Game Area */}
      <div className="game-area">
        {/* Question Display */}
        {gameState.status === 'playing' && gameState.questions.length > 0 && (
          <motion.div 
            className="question-container"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" }}
          >
            {/* Question Header */}
            <div className="question-header">
              <div className="question-category">
                <span className="category-icon">
                  {QUIZ_CATEGORIES[gameState.category].icon}
                </span>
                <span>{QUIZ_CATEGORIES[gameState.category].name}</span>
              </div>
              
              <div className="timer-display">
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: gameState.timeLeft <= 10 ? [1, 1.2, 1] : 1
                  }}
                  transition={{ 
                    rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                    scale: { duration: 0.5, repeat: Infinity }
                  }}
                  className="timer-icon"
                  style={{ 
                    color: gameState.timeLeft <= 10 ? '#FF0000' : '#4ECDC4'
                  }}
                >
                  <Clock className="icon" />
                </motion.div>
                <span className="timer-number">{gameState.timeLeft}</span>
              </div>
            </div>

            {/* Question Text */}
            <motion.div 
              className="question-text"
              key={gameState.currentQuestion}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <h3>{gameState.questions[gameState.currentQuestion].question}</h3>
            </motion.div>

            {/* Answer Options */}
            <div className="answers-container">
              {gameState.questions[gameState.currentQuestion].answers.map((answer, index) => (
                <motion.button
                  key={index}
                  className={`answer-btn ${
                    gameState.answered ? 
                      (index === gameState.correctAnswer ? 'correct' : 
                       index === gameState.selectedAnswer ? 'wrong' : '') :
                      ''
                  } ${gameState.answered && index === gameState.selectedAnswer ? 'selected' : ''}`}
                  onClick={() => selectAnswer(index)}
                  disabled={gameState.answered}
                  initial={{ x: index % 2 === 0 ? -100 : 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                  whileHover={!gameState.answered ? { scale: 1.02 } : {}}
                  whileTap={!gameState.answered ? { scale: 0.98 } : {}}
                >
                  <div className="answer-letter">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <div className="answer-text">
                    {answer}
                  </div>
                  
                  {gameState.answered && index === gameState.selectedAnswer && (
                    <motion.div
                      className="answer-feedback"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {index === gameState.correctAnswer ? (
                        <span className="correct-icon">✅</span>
                      ) : (
                        <span className="wrong-icon">❌</span>
                      )}
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Power-ups */}
            <div className="power-ups-container">
              {Object.entries(POWER_UPS).map(([key, powerUp]) => (
                <motion.button
                  key={key}
                  className="power-up-btn"
                  onClick={() => activatePowerUp(key)}
                  style={{ backgroundColor: powerUp.color }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {powerUp.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Progress Indicator */}
        {gameState.status === 'playing' && (
          <motion.div 
            className="progress-indicator"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="progress-info">
              <span>Pertanyaan {gameState.currentQuestion + 1} dari {gameState.questions.length}</span>
              <span>Skor: {gameState.score}</span>
            </div>
            <div className="progress-bar">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${((gameState.currentQuestion + 1) / gameState.questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}
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
            className="menu-brain"
          >
            🧠
          </motion.div>
          
          <h2>Selamat Datang di Rainbow Quiz Challenge!</h2>
          <p>Uji pengetahuanmu dengan pertanyaan berwarna-warni! 🌈</p>
          
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={startGame}
            className="start-button"
            style={{ 
              background: 'linear-gradient(45deg, #9D4EDD, #C77DFF, #E0AAFF)'
            }}
          >
            <Play className="icon" />
            Mulai Quiz!
          </motion.button>

          <div className="menu-instructions">
            <p><strong>🎮 Cara Bermain:</strong></p>
            <p>• Pilih kategori dan kesulitan</p>
            <p>• Jawab pertanyaan sebelum waktu habis</p>
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
            className="sad-brain"
          >
            🧠😢
          </motion.div>
          
          <h3>Quiz Selesai!</h3>
          
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
              <span>Akurasi: {Math.round(((gameState.questions.filter((q, i) => 
                gameState.questions[i].correct === gameState.selectedAnswer).length / 
                gameState.questions.length) * 100))}%</span>
            </motion.div>
            
            <motion.div 
              className="stat-item"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Star className="icon" />
              <span>Combo: {gameState.combo}</span>
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => initializeGame()}
            className="restart-button"
            style={{ 
              background: 'linear-gradient(45deg, #9D4EDD, #C77DFF, #E0AAFF)'
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

export default QuizGame;

