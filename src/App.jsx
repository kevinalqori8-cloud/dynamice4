import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, BrowserRouter } from "react-router-dom";
import Home from "./Pages/Home";
import Gallery from "./components/Gallery";
import Tabs from "./Pages/Tabs";
import Footer from "./Pages/Footer";
import ChatPage from "./Pages/ChatPage";
import Navbar from "./components/Navbar";
import SuggestionBox from "./components/SuggestionBox";
import ChatMindMap from "./Pages/ChatMindMap";
import ChatAnonimLocalPage from "./Pages/ChatAnonimLocalPage";
import SuggestionPage from "./Pages/SuggestionPage";
import AOS from "aos";
import "aos/dist/aos.css";
import ProfilePage from "./Pages/ProfilePage";
import PortfolioPage from "./Pages/PortfolioPage";
import Mines from "./Pages/game/Mines";
import GameReme from "./Pages/game/GameReme";
import Game from "./Pages/Game";
import LuckyWheel from "./Pages/game/LuckyWheel";
import { AuthProvider } from "./context/AuthContext";
import Leaderboard from "./components/Leaderboard";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import DinoRunner from "./Pages/game/DinoRunner.jsx";
import FishIt from "./Pages/game/FishIt.jsx";
import BlockBlast from "./Pages/game/BlockBlast.jsx";
import MemoryCardGame from "./Pages/game/MemoryCardGame.jsx";
import QuizChallenge from "./Pages/game/QuizChallenge.jsx";
import TowerDefense from "./Pages/game/TowerDefense.jsx";

// 🛡️ Ultra Fixed App Component - No More Errors!
class UltraErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center p-4">
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold mb-4">Oops! Terjadi Kesalahan</h2>
            <p className="text-gray-300 mb-6">
              Maaf, terjadi kesalahan dalam aplikasi. Silakan coba lagi.
            </p>
            <button 
              onClick={this.handleReset}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              🔄 Muulai Ulang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Layout Component untuk halaman utama
function HomeLayout() {
  useEffect(() => {
    AOS.init({ 
      duration: 800, 
      once: true,
      offset: 100,
      delay: 100
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar />
      <main>
        <Home />
        <Tabs />
        <SuggestionBox />
      </main>
      <Footer />
    </div>
  );
}

// Layout Component untuk halaman dengan Navbar
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}

// Loading Component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading XE-4 Gaming Portal...</p>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <UltraErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Main Routes */}
            <Route path="/" element={<HomeLayout />} />
            <Route path="/game" element={<AppLayout><Game /></AppLayout>} />
            <Route path="/chat" element={<AppLayout><ChatPage /></AppLayout>} />
            <Route path="/chat-mindmap" element={<AppLayout><ChatMindMap /></AppLayout>} />
            <Route path="/chat-anonim" element={<AppLayout><ChatAnonimLocalPage /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
            <Route path="/portfolio" element={<AppLayout><PortfolioPage /></AppLayout>} />
            <Route path="/suggestion" element={<AppLayout><SuggestionPage /></AppLayout>} />
            <Route path="/leaderboard" element={<AppLayout><Leaderboard /></AppLayout>} />
            <Route path="/gallery" element={<AppLayout><Gallery /></AppLayout>} />
            
            {/* Game Routes */}
            <Route path="/game/fishing" element={<AppLayout><FishIt /></AppLayout>} />
            <Route path="/game/dino" element={<AppLayout><DinoRunner /></AppLayout>} />
            <Route path="/game/blockblast" element={<AppLayout><BlockBlast /></AppLayout>} />
            <Route path="/game/reme" element={<AppLayout><GameReme /></AppLayout>} />
            <Route path="/game/mines" element={<AppLayout><Mines /></AppLayout>} />
            <Route path="/game/luckywheel" element={<AppLayout><LuckyWheel /></AppLayout>} />
            
            {/* New Games */}
            <Route path="/game/memory" element={<AppLayout><MemoryCardGame /></AppLayout>} />
            <Route path="/game/quiz" element={<AppLayout><QuizChallenge /></AppLayout>} />
            <Route path="/game/towerdefense" element={<AppLayout><TowerDefense /></AppLayout>} />
            
            {/* Catch all route */}
            <Route path="*" element={
              <AppLayout>
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-xl mb-4">Halaman tidak ditemukan</p>
                    <button 
                      onClick={() => window.history.back()}
                      className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg"
                    >
                      Kembali
                    </button>
                  </div>
                </div>
              </AppLayout>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </UltraErrorBoundary>
  );
}

export default App;
