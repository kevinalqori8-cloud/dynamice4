// src/App.jsx - VERSI FIXED & OPTIMIZED
import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Box, CircularProgress } from "@mui/material";
import AOS from "aos";
import "aos/dist/aos.css";

// 🎯 Layout Components yang proper
import Navbar from "./components/Navbar";
import Footer from "./Pages/Footer";
import { AuthProvider } from "./context/AuthContext";

// 🚀 Code Splitting dengan Lazy Loading
const Home = lazy(() => import("./Pages/Home"));
const Tabs = lazy(() => import("./Pages/Tabs"));
const SuggestionBox = lazy(() => import("./components/SuggestionBox"));
const Gallery = lazy(() => import("./components/Gallery"));
const ChatPage = lazy(() => import("./Pages/ChatPage"));
const ChatMindMap = lazy(() => import("./Pages/ChatMindMap"));
const ChatAnonimLocalPage = lazy(() => import("./Pages/ChatAnonimLocalPage"));
const ProfilePage = lazy(() => import("./Pages/ProfilePage"));
const PortfolioPage = lazy(() => import("./Pages/PortfolioPage"));
const SuggestionPage = lazy(() => import("./Pages/SuggestionPage"));
const Leaderboard = lazy(() => import("./components/Leaderboard"));
const Game = lazy(() => import("./Pages/Game"));

// 🎮 Games dengan code splitting
const FishIt = lazy(() => import("./Pages/game/FishIt.jsx"));
const DinoRunner = lazy(() => import("./Pages/game/DinoRunner.jsx"));
const BlockBlast = lazy(() => import("./Pages/game/BlockBlast.jsx"));
const GameReme = lazy(() => import("./Pages/game/GameReme"));
const Mines = lazy(() => import("./Pages/game/Mines"));
const LuckyWheel = lazy(() => import("./Pages/game/LuckyWheel"));
const MemoryCardGame = lazy(() => import("./Pages/game/MemoryCardGame.jsx"));
const SnakeGame = lazy(() => import("./Pages/game/SnakeGame.jsx"));
const SpaceShooter = lazy(() => import("./Pages/game/SpaceShooterGame.jsx"));
const QuizChallenge = lazy(() => import("./Pages/game/QuizChallenge.jsx"));
const TowerDefense = lazy(() => import("./Pages/game/TowerDefense.jsx"));

// 🎯 Enhanced Loading Component
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      width: '100%',
      gap: 3,
    }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    >
      <CircularProgress 
        size={60}
        thickness={4}
        sx={{
          color: 'primary.main',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
    </motion.div>
    
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            fontSize: '2rem',
            mb: 1,
            display: 'inline-block',
            animation: 'pulse 2s infinite',
          }}
        >
          🎮
        </Box>
        <Box sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Loading Dynamic E4 Experience...
        </Box>
        <Box sx={{ color: 'text.disabled', fontSize: '0.875rem', mt: 1 }}>
          Preparing your gaming portal
        </Box>
      </Box>
    </motion.div>
  </Box>
);

// 🏗️ Unified Layout Component
function AppLayout({ children, showNavbar = true, showFooter = true }) {
  const location = useLocation();
  
  // Initialize AOS hanya sekali
  React.useEffect(() => {
    AOS.init({ 
      duration: 800, 
      once: true,
      offset: 100,
      delay: 100,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(138, 43, 226, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0, 188, 212, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      
      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {showNavbar && <Navbar />}
        
        <Box component="main" sx={{ pt: showNavbar ? 16 : 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </Box>
        
        {showFooter && <Footer />}
      </Box>
    </Box>
  );
}

// 🎯 Route Components yang organized
const HomePage = () => (
  <AppLayout>
    <Home />
    <Tabs />
    <SuggestionBox />
  </AppLayout>
);

const GamePage = () => (
  <AppLayout>
    <Game />
  </AppLayout>
);

const ChatPage = () => (
  <AppLayout>
    <ChatPage />
  </AppLayout>
);

// 🎮 Game Wrapper dengan proper loading
const GameWrapper = ({ children, title }) => (
  <AppLayout showNavbar={true} showFooter={true}>
    <Box sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </Box>
  </AppLayout>
);

// 🚨 404 Component yang proper
const NotFoundPage = () => {
  const navigate = useNavigate();
  
  return (
    <AppLayout>
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Box sx={{ fontSize: '6rem', mb: 2 }}>🎮</Box>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              background: 'linear-gradient(45deg, #8a2be2, #00bcd4)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
            }}
          >
            404 - Game Over
          </Typography>
          
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Halaman tidak ditemukan atau level belum terbuka!
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={() => navigate(-1)}
              sx={{
                background: 'linear-gradient(45deg, #8a2be2, #00bcd4)',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7a1be2, #00acc4)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              ← Kembali
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              sx={{
                borderColor: '#8a2be2',
                color: '#8a2be2',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 'bold',
                '&:hover': {
                  background: 'rgba(138, 43, 226, 0.1)',
                  borderColor: '#7a1be2',
                },
              }}
            >
              🏠 Home
            </Button>
          </Box>
        </motion.div>
      </Box>
    </AppLayout>
  );
};

// 🎯 Main App Component - CLEAN & OPTIMIZED
function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat-mindmap" element={<AppLayout><ChatMindMap /></AppLayout>} />
          <Route path="/chat-anonim" element={<AppLayout><ChatAnonimLocalPage /></AppLayout>} />
          <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
          <Route path="/portfolio" element={<AppLayout><PortfolioPage /></AppLayout>} />
          <Route path="/suggestion" element={<AppLayout><SuggestionPage /></AppLayout>} />
          <Route path="/leaderboard" element={<AppLayout><Leaderboard /></AppLayout>} />
          <Route path="/gallery" element={<AppLayout><Gallery /></AppLayout>} />
          
          {/* Game Routes dengan proper code splitting */}
          <Route path="/game/fishing" element={<GameWrapper><FishIt /></GameWrapper>} />
          <Route path="/game/dino" element={<GameWrapper><DinoRunner /></GameWrapper>} />
          <Route path="/game/blockblast" element={<GameWrapper><BlockBlast /></GameWrapper>} />
          <Route path="/game/reme" element={<GameWrapper><GameReme /></GameWrapper>} />
          <Route path="/game/mines" element={<GameWrapper><Mines /></GameWrapper>} />
          <Route path="/game/luckywheel" element={<GameWrapper><LuckyWheel /></GameWrapper>} />
          <Route path="/game/memory" element={<GameWrapper><MemoryCardGame /></GameWrapper>} />
          <Route path="/game/snake" element={<GameWrapper><SnakeGame /></GameWrapper>} />
          <Route path="/game/spaceshoot" element={<GameWrapper><SpaceShooter /></GameWrapper>} />
          <Route path="/game/quiz" element={<GameWrapper><QuizChallenge /></GameWrapper>} />
          <Route path="/game/towerdefense" element={<GameWrapper><TowerDefense /></GameWrapper>} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;

