// src/App.jsx - Updated Paths
import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Box, CircularProgress } from "@mui/material";
import AOS from "aos";
import "aos/dist/aos.css";

// Layout Components
import Navbar from "./components/Navbar";
import Footer from "./Pages/Footer";
import { AuthProvider } from "./context/AuthContext";

// Lazy Loading Components
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
const MusicDedication = lazy(() => import("./components/MusicDedication.jsx"));

// Games dengan path yang sudah diperbarui
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

// Enhanced Loading Component
const LoadingFallback = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
    }}
  >
    <CircularProgress
      size={60}
      sx={{
        color: "#8a2be2",
        mb: 3,
      }}
    />
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 sx={{ color: "white", fontWeight: 600, mb: 1 }}>
        Loading Dynamic E4 Experience...
      </h2>
      <p sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
        Preparing your gaming portal
      </p>
    </motion.div>
  </Box>
);

// Unified Layout Component
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
    <AuthProvider>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen relative overflow-hidden"
        >
          {/* Animated background elements */}
          <div className="fixed inset-0 z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-purple-500/10 to-blue-500/10"></div>
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {showNavbar && <Navbar />}
            {children}
          </div>

          {showFooter && <Footer />}
        </motion.div>
      </AnimatePresence>
    </AuthProvider>
  );
}

function App() {
  const location = useLocation();

  return (
    <AppLayout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes location={location}>
          {/* Main Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/tabs" element={<Tabs />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/menu" element={<ChatMindMap />} /> {/* UPDATED: Chat MindMap jadi Menu */}
          <Route path="/chat/anonim" element={<ChatAnonimLocalPage />} />
          <Route path="/profile/:nama" element={<ProfilePage />} /> {/* UPDATED: Profil dengan path baru */}
          <Route path="/suggestion" element={<SuggestionPage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/game" element={<Game />} />
	  <Route path="/music" element={<MusicDedication />} />

          {/* UPDATED: Portfolio dengan dynamic path */}
          <Route path="/portfolio/:nama" element={<PortfolioPage />} />

          {/* Game Pages - Path tetap sama seperti yang kamu definisikan */}
          <Route path="/game/fishing" element={<FishIt />} />
          <Route path="/game/dino" element={<DinoRunner />} />
          <Route path="/game/snake" element={<SnakeGame />} />
          <Route path="/game/spaceshoot" element={<SpaceShooter />} />
          <Route path="/game/blockblast" element={<BlockBlast />} />
          <Route path="/game/reme" element={<GameReme />} />
          <Route path="/game/luckywheel" element={<LuckyWheel />} />
          <Route path="/game/mines" element={<Mines />} />
          <Route path="/game/memory" element={<MemoryCardGame />} />
          <Route path="/game/quiz" element={<QuizChallenge />} />
          <Route path="/game/towerdefense" element={<TowerDefense />} />

          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}

export default App;

