import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Typography, Box, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Grid, LinearProgress, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../../hooks/useFirebaseData';
import { userService } from '../../service/firebaseService';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimerIcon from '@mui/icons-material/Timer';
import SchoolIcon from '@mui/icons-material/School';

// 🎯 Quiz Challenge - Tes Pengetahuan Umum
const QuizChallenge = () => {
  const navigate = useNavigate();
  const { userData } = useUserData();
  
  // Game States
  const [gameState, setGameState] = useState('menu'); // menu, playing, completed, failed
  const [category, setCategory] = useState('mixed');
  const [difficulty, setDifficulty] = useState('medium');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);

  // Question database
  const questionsDatabase = {
    matematika: [
      {
        question: "Berapa hasil dari 15 + 27 × 3?",
        options: ["126", "96", "120", "156"],
        correct: 1,
        explanation: "Gunakan urutan operasi: 27 × 3 = 81, lalu 15 + 81 = 96"
      },
      {
        question: "Sebuah lingkaran memiliki diameter 14 cm. Berapa kelilingnya?",
        options: ["44 cm", "88 cm", "154 cm", "616 cm"],
        correct: 0,
        explanation: "Keliling = π × d = 22/7 × 14 = 44 cm"
      },
      {
        question: "Jika f(x) = 2x² - 5x + 3, berapa nilai f(4)?",
        options: ["15", "20", "25", "30"],
        correct: 0,
        explanation: "f(4) = 2(16) - 5(4) + 3 = 32 - 20 + 3 = 15"
      },
      {
        question: "Berapa sudut dalam segitiga yang sama kaki?",
        options: ["45°, 45°, 90°", "60°, 60°, 60°", "30°, 60°, 90°", "Tergantung ukuran"],
        correct: 3,
        explanation: "Sudut segitiga sama kaki tergantung pada ukuran sudut yang diberikan"
      },
      {
        question: "Volume kubus dengan rusuk 5 cm adalah?",
        options: ["125 cm³", "150 cm³", "100 cm³", "25 cm³"],
        correct: 0,
        explanation: "Volume kubus = s³ = 5³ = 125 cm³"
      }
    ],
    ipa: [
      {
        question: "Planet terbesar di tata surya kita adalah?",
        options: ["Bumi", "Mars", "Jupiter", "Saturnus"],
        correct: 2,
        explanation: "Jupiter adalah planet terbesar dengan diameter sekitar 142,984 km"
      },
      {
        question: "Berapa kecepatan cahaya di ruang hampa?",
        options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"],
        correct: 0,
        explanation: "Kecepatan cahaya di ruang hampa adalah sekitar 299,792 km/s atau bulatannya 300,000 km/s"
      },
      {
        question: "Unsur dengan simbol 'O' adalah?",
        options: ["Emas", "Perak", "Oksigen", "Osmium"],
        correct: 2,
        explanation: "O adalah simbol untuk Oksigen (Oxygen)"
      },
      {
        question: "Hewan yang termasuk mamalia bertelur adalah?",
        options: ["Kangguru", "Platypus", "Koala", "Wombat"],
        correct: 1,
        explanation: "Platypus adalah salah satu dari sedikit mamalia yang bertelur"
      },
      {
        question: "Berapa tekanan atmosfer di permukaan laut?",
        options: ["1 atm", "10 atm", "0.5 atm", "100 atm"],
        correct: 0,
        explanation: "Tekanan atmosfer normal di permukaan laut adalah 1 atmosfer (1 atm)"
      }
    ],
    ips: [
      {
        question: "Presiden pertama Republik Indonesia adalah?",
        options: ["Soekarno", "Mohammad Hatta", "Sutan Sjahrir", "Amir Sjarifuddin"],
        correct: 0,
        explanation: "Ir. Soekarno adalah Presiden pertama Republik Indonesia"
      },
      {
        question: "Ibukota negara Malaysia adalah?",
        options: ["Kuala Lumpur", "Putrajaya", "Johor Bahru", "Penang"],
        correct: 1,
        explanation: "Putrajaya adalah ibukota administratif Malaysia sejak 1999"
      },
      {
        question: "Organisasi Perserikatan Bangsa-Bangsa (PBB) didirikan pada tahun?",
        options: ["1945", "1946", "1947", "1948"],
        correct: 0,
        explanation: "PBB didirikan pada 24 Oktober 1945 setelah Perang Dunia II"
      },
      {
        question: "Mata uang resmi negara Jepang adalah?",
        options: ["Won", "Yuan", "Yen", "Dollar"],
        correct: 2,
        explanation: "Yen adalah mata uang resmi Jepang dengan simbol ¥"
      },
      {
        question: "Siapa penulis novel 'Laskar Pelangi'?",
        options: ["Andrea Hirata", "Ahmad Fuadi", "Tere Liye", "Dewi Lestari"],
        correct: 0,
        explanation: "Andrea Hirata adalah penulis novel 'Laskar Pelangi'"
      }
    ],
    bahasa: [
      {
        question: "Kata 'indah' dalam kalimat 'Pemandangan itu sangat indah' berfungsi sebagai?",
        options: ["Subjek", "Predikat", "Objek", "Keterangan"],
        correct: 1,
        explanation: "'Indah' berfungsi sebagai predikat yang menjelaskan subjek 'pemandangan'"
      },
      {
        question: "Antonim dari kata 'cerdas' adalah?",
        options: ["Pintar", "Bodoh", "Cerdik", "Genius"],
        correct: 1,
        explanation: "Antonim 'cerdas' adalah 'bodoh' yang memiliki arti berlawanan"
      },
      {
        question: "Tanda baca yang tepat untuk kalimat 'Halo apa kabar'?",
        options: ["Halo, apa kabar?", "Halo apa kabar!", "Halo apa kabar.", "Halo: apa kabar"],
        correct: 0,
        explanation: "Kalimat pertanyaan harus diakhiri dengan tanda tanya (?)"
      },
      {
        question: "Kata berimbuhan 'memperhatikan' terdiri dari?",
        options: ["Me- + perhatian", "Memper- + hatikan", "Memper- + hati + -kan", "Me- + per + hati + -kan"],
        correct: 2,
        explanation: "'Memperhatikan' = memper- (imbuhan) + hati (kata dasar) + -kan (imbuhan)"
      },
      {
        question: "Sinonim dari kata 'megah' adalah?",
        options: ["Sederhana", "Mewah", "Biasa", "Sederhana"],
        correct: 1,
        explanation: "Sinonim 'megah' adalah 'mewah' yang memiliki arti yang sama"
      }
    ]
  };

  // Game settings
  const gameSettings = {
    easy: { questions: 5, timePerQuestion: 30, pointsPerQuestion: 100 },
    medium: { questions: 7, timePerQuestion: 20, pointsPerQuestion: 150 },
    hard: { questions: 10, timePerQuestion: 15, pointsPerQuestion: 200 }
  };

  // Initialize game
  const initializeGame = useCallback((selectedCategory, selectedDifficulty) => {
    const categoryQuestions = questionsDatabase[selectedCategory] || 
      Object.values(questionsDatabase).flat().sort(() => Math.random() - 0.5);
    
    const settings = gameSettings[selectedDifficulty];
    const gameQuestions = categoryQuestions.slice(0, settings.questions);
    
    setCategory(selectedCategory);
    setDifficulty(selectedDifficulty);
    setCards(gameQuestions);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setTime(0);
    setAnswers([]);
    setGameState('playing');
    setShowResult(false);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && selectedAnswer === null) {
      const settings = gameSettings[difficulty];
      interval = setInterval(() => {
        setTime(prev => {
          const newTime = prev + 1;
          if (newTime >= settings.timePerQuestion) {
            handleAnswer(null); // Time's up
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, selectedAnswer, difficulty]);

  // Handle answer selection
  const handleAnswer = (answerIndex) => {
    if (selectedAnswer !== null) return; // Prevent multiple answers
    
    setSelectedAnswer(answerIndex);
    const currentQ = questions[currentQuestion];
    const isCorrect = answerIndex === currentQ.correct;
    const settings = gameSettings[difficulty];
    
    // Calculate points with time bonus
    const timeBonus = Math.max(0, (settings.timePerQuestion - time) * 5);
    const points = isCorrect ? (settings.pointsPerQuestion + timeBonus) : 0;
    
    setScore(prev => prev + points);
    
    // Save answer
    setAnswers(prev => [...prev, {
      question: currentQ.question,
      selectedAnswer: answerIndex !== null ? currentQ.options[answerIndex] : 'Waktu habis',
      correctAnswer: currentQ.options[currentQ.correct],
      isCorrect,
      points,
      time: time
    }]);
    
    // Move to next question or finish game
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setTime(0);
      } else {
        setGameState('completed');
        setShowResult(true);
        
        // Save to leaderboard
        if (userData?.uid) {
          userService.addScore(userData.uid, 'quiz', score);
        }
      }
    }, 2000);
  };

  // Format time
  const formatTime = (seconds) => {
    return `${seconds}s`;
  };

  // Calculate accuracy
  const calculateAccuracy = () => {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    return Math.round((correctAnswers / answers.length) * 100);
  };

  // Reset game
  const resetGame = () => {
    setGameState('menu');
    setShowResult(false);
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
              🎯 Quiz Challenge
            </motion.h1>
            <p className="text-xl text-gray-300">Tantang pengetahuanmu dengan quiz seru!</p>
          </div>

          {/* Game Stats */}
          {userData && (
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 mb-8">
              <Typography variant="h6" className="mb-4 text-center">📊 Statistik Kamu</Typography>
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <div className="text-center">
                    <Typography variant="h4" className="text-purple-400">{userData.gameStats?.quiz?.gamesPlayed || 0}</Typography>
                    <Typography variant="body2" className="text-gray-400">Games Played</Typography>
                  </div>
                </Grid>
                <Grid item xs={4}>
                  <div className="text-center">
                    <Typography variant="h4" className="text-blue-400">{userData.gameStats?.quiz?.highScore || 0}</Typography>
                    <Typography variant="body2" className="text-gray-400">High Score</Typography>
                  </div>
                </Grid>
                <Grid item xs={4}>
                  <div className="text-center">
                    <Typography variant="h4" className="text-green-400">{userData.gameStats?.quiz?.bestAccuracy || 0}%</Typography>
                    <Typography variant="body2" className="text-gray-400">Best Accuracy</Typography>
                  </div>
                </Grid>
              </Grid>
            </div>
          )}

          {/* Category Selection */}
          <div className="mb-8">
            <Typography variant="h5" className="text-white text-center mb-4">Pilih Kategori</Typography>
            <Grid container spacing={3}>
              {[
                { key: 'mixed', name: 'Campuran', icon: '🎲', color: 'from-purple-400 to-pink-400' },
                { key: 'matematika', name: 'Matematika', icon: '🔢', color: 'from-blue-400 to-cyan-400' },
                { key: 'ipa', name: 'IPA', icon: '🧪', color: 'from-green-400 to-emerald-400' },
                { key: 'ips', name: 'IPS', icon: '🌍', color: 'from-orange-400 to-red-400' },
                { key: 'bahasa', name: 'Bahasa', icon: '📚', color: 'from-indigo-400 to-purple-400' },
              ].map((cat) => (
                <Grid item xs={6} md={2.4} key={cat.key}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Paper
                      className={`bg-gradient-to-br ${cat.color} p-4 cursor-pointer hover:shadow-lg transition-all duration-300 text-center`}
                      onClick={() => setCategory(cat.key)}
                    >
                      <div className="text-3xl mb-2">{cat.icon}</div>
                      <Typography variant="body1" className="text-white font-semibold">
                        {cat.name}
                      </Typography>
                      {category === cat.key && (
                        <Chip label="Selected" size="small" className="mt-2 bg-white/30" />
                      )}
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-8">
            <Typography variant="h5" className="text-white text-center mb-4">Pilih Kesulitan</Typography>
            <Grid container spacing={3} justifyContent="center">
              {[
                { key: 'easy', name: 'Mudah', icon: '🟢', color: 'from-green-400 to-emerald-400', questions: 5 },
                { key: 'medium', name: 'Sedang', icon: '🟡', color: 'from-yellow-400 to-orange-400', questions: 7 },
                { key: 'hard', name: 'Sulit', icon: '🔴', color: 'from-red-400 to-pink-400', questions: 10 },
              ].map((diff) => (
                <Grid item xs={12} md={4} key={diff.key}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Paper
                      className={`bg-gradient-to-br ${diff.color} p-6 cursor-pointer hover:shadow-lg transition-all duration-300 text-center`}
                      onClick={() => setDifficulty(diff.key)}
                    >
                      <div className="text-4xl mb-3">{diff.icon}</div>
                      <Typography variant="h6" className="text-white font-bold mb-2">
                        {diff.name}
                      </Typography>
                      <Typography variant="body2" className="text-white/80 mb-2">
                        {diff.questions} pertanyaan
                      </Typography>
                      <Typography variant="caption" className="text-white/60">
                        {diff.key === 'easy' && '30 detik per soal'}
                        {diff.key === 'medium' && '20 detik per soal'}
                        {diff.key === 'hard' && '15 detik per soal'}
                      </Typography>
                      {difficulty === diff.key && (
                        <Chip label="Selected" size="small" className="mt-3 bg-white/30" />
                      )}
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <Button
              variant="contained"
              size="large"
              onClick={() => initializeGame(category, difficulty)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
              startIcon={<SchoolIcon />}
            >
              Mulai Quiz
            </Button>
          </div>

          {/* Back Button */}
          <div className="text-center mt-4">
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
  const currentQ = questions[currentQuestion];
  const settings = gameSettings[difficulty];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const timeProgress = (time / settings.timePerQuestion) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Game Header */}
        <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outlined"
              onClick={resetGame}
              className="text-white border-white hover:bg-white hover:text-purple-900"
              startIcon={<RefreshIcon />}
            >
              Menu
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TimerIcon className="text-blue-400" />
                <Typography className="text-white">
                  {formatTime(time)} / {settings.timePerQuestion}s
                </Typography>
              </div>
              
              <Chip 
                label={`${currentQuestion + 1}/${questions.length}`} 
                color="primary"
              />
              
              <div className="flex items-center gap-2">
                <EmojiEventsIcon className="text-yellow-400" />
                <Typography className="text-white font-bold">
                  {score}
                </Typography>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-2">
            <Typography variant="body2" className="text-white mb-1">
              Progress: {currentQuestion + 1}/{questions.length}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              className="bg-gray-700"
              sx={{
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #8a2be2, #00bcd4)'
                }
              }}
            />
          </div>
          
          {/* Time Bar */}
          <div>
            <Typography variant="body2" className="text-white mb-1">
              Waktu tersisa
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={100 - timeProgress} 
              className="bg-gray-700"
              color={time > settings.timePerQuestion * 0.7 ? "error" : "success"}
            />
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
        >
          <Paper className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <div className="mb-6">
              <Typography variant="h5" className="text-white mb-4">
                Pertanyaan {currentQuestion + 1}
              </Typography>
              <Typography variant="h6" className="text-white leading-relaxed">
                {currentQ.question}
              </Typography>
            </div>

            {/* Answer Options */}
            <Grid container spacing={3}>
              {currentQ.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQ.correct;
                const showResult = selectedAnswer !== null;
                
                let buttonColor = "bg-gray-600 hover:bg-gray-700";
                if (showResult) {
                  if (isCorrect) {
                    buttonColor = "bg-green-600";
                  } else if (isSelected && !isCorrect) {
                    buttonColor = "bg-red-600";
                  }
                } else if (isSelected) {
                  buttonColor = "bg-blue-600";
                }

                return (
                  <Grid item xs={12} md={6} key={index}>
                    <motion.div whileHover={!showResult ? { scale: 1.02 } : {}} whileTap={!showResult ? { scale: 0.98 } : {}}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => !showResult && handleAnswer(index)}
                        disabled={showResult}
                        className={`${buttonColor} text-white py-4 px-6 rounded-lg text-left h-full transition-all duration-300`}
                        sx={{
                          textTransform: 'none',
                          fontSize: '1rem',
                          fontWeight: '500'
                        }}
                      >
                        <div className="flex items-center">
                          <span className="mr-3 font-bold">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          {option}
                        </div>
                      </Button>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>

            {/* Explanation */}
            {selectedAnswer !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-black/30 rounded-lg"
              >
                <Typography variant="h6" className="text-white mb-2">
                  {answers[answers.length - 1]?.isCorrect ? "✅ Benar!" : "❌ Salah"}
                </Typography>
                <Typography variant="body1" className="text-gray-300">
                  {currentQ.explanation}
                </Typography>
              </motion.div>
            )}
          </Paper>
        </motion.div>
      </div>

      {/* Result Dialog */}
      <Dialog open={showResult} onClose={() => setShowResult(false)} maxWidth="md" fullWidth>
        <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <DialogTitle className="text-white text-center">
            <div className="text-6xl mb-4">🎉</div>
            <Typography variant="h4" className="font-bold">
              Quiz Selesai!
            </Typography>
          </DialogTitle>
          <DialogContent className="text-white">
            <div className="text-center space-y-6">
              {/* Score Display */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/30 rounded-lg p-4">
                  <Typography variant="h4" className="text-purple-400">{score}</Typography>
                  <Typography variant="body2" className="text-gray-400">Total Score</Typography>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <Typography variant="h4" className="text-blue-400">{answers.length}</Typography>
                  <Typography variant="body2" className="text-gray-400">Questions</Typography>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <Typography variant="h4" className="text-green-400">{calculateAccuracy()}%</Typography>
                  <Typography variant="body2" className="text-gray-400">Accuracy</Typography>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <Typography variant="h4" className="text-yellow-400">
                    {answers.filter(a => a.isCorrect).length}
                  </Typography>
                  <Typography variant="body2" className="text-gray-400">Correct</Typography>
                </div>
              </div>

              {/* Performance Analysis */}
              <div className="bg-black/30 rounded-lg p-6">
                <Typography variant="h6" className="mb-4">📊 Analisis Performa</Typography>
                <div className="space-y-3">
                  {answers.slice(0, 3).map((answer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded">
                      <div className="flex items-center">
                        <span className={`mr-3 text-xl ${answer.isCorrect ? '✅' : '❌'}`}>
                          {answer.isCorrect ? '✅' : '❌'}
                        </span>
                        <Typography variant="body2" className="text-gray-300">
                          Soal {index + 1}
                        </Typography>
                      </div>
                      <Typography variant="body2" className={answer.isCorrect ? 'text-green-400' : 'text-red-400'}>
                        {answer.points} pts
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grade */}
              <div className="bg-black/30 rounded-lg p-6">
                <Typography variant="h6" className="mb-2">🏆 Penilaian</Typography>
                <Typography variant="h3" className="font-bold">
                  {calculateAccuracy() >= 90 ? 'A (Excellent)' :
                   calculateAccuracy() >= 80 ? 'B (Good)' :
                   calculateAccuracy() >= 70 ? 'C (Average)' :
                   calculateAccuracy() >= 60 ? 'D (Below Average)' : 'E (Needs Improvement)'}
                </Typography>
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

export default QuizChallenge;
