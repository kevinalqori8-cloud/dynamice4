// src/Pages/game/QuizChallenge.jsx - FIXED

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSafeGame } from '../../hooks/useSafeGame';

const QuizChallenge = () => {
  const navigate = useNavigate();
  const { safeLocalStorage } = useSafeGame();
  
  // Quiz data yang lengkap
  const quizData = [
    {
      id: 1,
      question: "Apa ibu kota Indonesia?",
      options: ["Jakarta", "Bandung", "Surabaya", "Medan"],
      correctAnswer: 0,
      category: "Geography",
      difficulty: "Easy"
    },
    {
      id: 2,
      question: "Berapa hasil dari 8 x 7?",
      options: ["54", "56", "58", "60"],
      correctAnswer: 1,
      category: "Math",
      difficulty: "Easy"
    },
    {
      id: 3,
      question: "Siapa penemu lampu pijar?",
      options: ["Thomas Edison", "Albert Einstein", "Isaac Newton", "Galileo"],
      correctAnswer: 0,
      category: "History",
      difficulty: "Medium"
    },
    {
      id: 4,
      question: "Apa lambang kimia untuk air?",
      options: ["O2", "CO2", "H2O", "N2"],
      correctAnswer: 2,
      category: "Science",
      difficulty: "Medium"
    },
    {
      id: 5,
      question: "Berapa sudut dalam segitiga?",
      options: ["90°", "180°", "360°", "120°"],
      correctAnswer: 1,
      category: "Math",
      difficulty: "Easy"
    },
    {
      id: 6,
      question: "Apa kepanjangan dari 'www'?",
      options: ["World Wide Web", "World Wide Network", "Web Wide World", "World Web Wide"],
      correctAnswer: 0,
      category: "Technology",
      difficulty: "Easy"
    },
    {
      id: 7,
      question: "Siapa penulis novel 'Laskar Pelangi'?",
      options: ["Andrea Hirata", "Ahmad Tohari", "Pramoedya Ananta Toer", "Chairil Anwar"],
      correctAnswer: 0,
      category: "Literature",
      difficulty: "Medium"
    },
    {
      id: 8,
      question: "Apa nama planet terbesar di tata surya?",
      options: ["Bumi", "Mars", "Jupiter", "Saturnus"],
      correctAnswer: 2,
      category: "Science",
      difficulty: "Easy"
    },
    {
      id: 9,
      question: "Berapa jumlah provinsi di Indonesia?",
      options: ["33", "34", "35", "38"],
      correctAnswer: 3,
      category: "Geography",
      difficulty: "Medium"
    },
    {
      id: 10,
      question: "Apa singkatan dari 'HTML'?",
      options: ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "HyperText Modern Language"],
      correctAnswer: 0,
      category: "Technology",
      difficulty: "Medium"
    }
  ];

  const [gameState, setGameState] = useState('ready'); // ready, playing, finished
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Initialize game
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Load player name
    const savedName = safeLocalStorage.getItem('gamehub_player_name', '');
    if (savedName) {
      setPlayerName(savedName);
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnsweredQuestions([]);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (showResult) return; // Prevent multiple answers
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === quizData[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 10);
    }
    
    // Record answer
    setAnsweredQuestions(prev => [...prev, {
      questionIndex: currentQuestion,
      selectedAnswer: answerIndex,
      isCorrect: isCorrect
    }]);
  };

  const nextQuestion = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Game finished
      setGameState('finished');
      saveScore();
    }
  };

  const saveScore = async () => {
    if (playerName && score > 0) {
      try {
        // Import userService dynamically
        const { userService } = await import('../../service/firebaseService');
        await userService.updateUserData(playerName, {
          quizScore: score,
          quizHighScore: Math.max(score, 0)
        });
      } catch (error) {
        console.warn('Could not save to Firebase:', error);
      }
    }
  };

  const getResultMessage = (isCorrect) => {
    if (isCorrect) {
      return ["Hebat! 🎉", "Benar! ⭐", "Bagus! 💪", "Tepat! 🎯"][Math.floor(Math.random() * 4)];
    } else {
      return ["Jangan menyerah! 💪", "Coba lagi! 🔄", "Belajar lebih giat! 📚", "Semangat! 🌟"][Math.floor(Math.random() * 4)];
    }
  };

  // Mobile touch handler
  const handleTouch = (answerIndex) => {
    if (!showResult) {
      handleAnswerSelect(answerIndex);
    }
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center border border-white/20"
        >
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-3xl font-bold text-white mb-4">Quiz Challenge</h1>
          <p className="text-white/80 mb-6">
            Tantang pengetahuanmu dengan quiz seru!
          </p>
          <p className="text-sm text-white/60 mb-6">
            Player: {playerName || 'Guest'}
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm text-white/60">
              <span>Total Questions:</span>
              <span>{quizData.length}</span>
            </div>
            <div className="flex justify-between text-sm text-white/60">
              <span>Categories:</span>
              <span>Multiple</span>
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105"
          >
            🚀 Mulai Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const correctAnswers = answeredQuestions.filter(q => q.isCorrect).length;
    const percentage = (correctAnswers / quizData.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center border border-white/20"
        >
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold text-white mb-4">Quiz Selesai!</h1>
          
          <div className="space-y-4 mb-6">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-2xl font-bold text-white mb-2">Score: {score}</p>
              <p className="text-lg text-white/80">
                {correctAnswers}/{quizData.length} benar ({Math.round(percentage)}%)
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-green-400 font-semibold">{correctAnswers}</p>
                <p className="text-white/60">Benar</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-red-400 font-semibold">{quizData.length - correctAnswers}</p>
                <p className="text-white/60">Salah</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={startGame}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all transform hover:scale-105"
            >
              🔄 Main Lagi
            </button>
            <button
              onClick={() => navigate('/game')}
              className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all"
            >
              ← Kembali
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main Game UI
  const currentQ = quizData[currentQuestion];
  const isAnswered = showResult;
  const isCorrect = selectedAnswer === currentQ.correctAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">🎯 Quiz Challenge</h1>
          <div className="flex justify-center items-center gap-4 text-white">
            <span>Question {currentQuestion + 1}/{quizData.length}</span>
            <span>•</span>
            <span>Score: {score}</span>
            <span>•</span>
            <span>Player: {playerName || 'Guest'}</span>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / quizData.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-center text-white/60 mt-2">
            {Math.round(((currentQuestion + 1) / quizData.length) * 100)}% Complete
          </p>
        </div>

        {/* Question Card */}
        <motion.div 
          className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Question */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentQ.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                currentQ.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {currentQ.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                {currentQ.category}
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-6">
              {currentQ.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQ.correctAnswer;
              const showCorrect = isAnswered && isCorrect;
              const showWrong = isAnswered && isSelected && !isCorrect;

              return (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  onTouchStart={() => handleTouch(index)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                    isAnswered
                      ? showCorrect
                        ? 'bg-green-500/20 border-2 border-green-500 text-white'
                        : showWrong
                        ? 'bg-red-500/20 border-2 border-red-500 text-white'
                        : 'bg-white/10 border border-white/20 text-white/60'
                      : isSelected
                      ? 'bg-purple-500/30 border-2 border-purple-500 text-white'
                      : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                  }`}
                  whileHover={{ scale: isAnswered ? 1 : 1.02 }}
                  whileTap={{ scale: isAnswered ? 1 : 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {isAnswered && (
                      <span className="text-2xl">
                        {showCorrect ? '✅' : showWrong ? '❌' : ''}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Result */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-xl bg-white/10 border border-white/20"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {isCorrect ? '✅' : '❌'}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {getResultMessage(isCorrect)}
                  </h3>
                  {isCorrect && (
                    <p className="text-green-400">+10 Points! 🎉</p>
                  )}
                  {!isCorrect && (
                    <p className="text-red-400">
                      Jawaban yang benar: <strong>{currentQ.options[currentQ.correctAnswer]}</strong>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Button */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center"
            >
              <button
                onClick={nextQuestion}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                {currentQuestion < quizData.length - 1 ? 'Next Question →' : 'Lihat Hasil 🏆'}
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Mobile Touch Indicator */}
        {isMobile && !showResult && (
          <div className="text-center text-white/60 text-sm">
            <p>Tap jawaban untuk memilih</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizChallenge;

