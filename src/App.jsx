import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
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

// Layout Component untuk halaman utama
function HomeLayout() {
  useEffect(() => AOS.init({ duration: 800, once: true }), []);
  
  return (
    <>
      <Navbar />
      <Home />
      <Tabs />
      <SuggestionBox />
      <Footer />
    </>
  );
}

// Layout Component untuk halaman dengan Navbar
function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

// Simple Error Boundary Component
function SimpleErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      console.error('Global error:', event.error);
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">💥</div>
          <h2 className="text-2xl font-bold text-white mb-4">Terjadi Kesalahan</h2>
          <p className="text-white/70 mb-6">
            {error?.message || "Terjadi masalah yang tidak terduga"}
          </p>
          <button 
            onClick={() => {
              setHasError(false);
              setError(null);
              window.location.reload();
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-lg text-white font-semibold"
          >
            Reload Halaman
          </button>
        </div>
      </div>
    );
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Routes>
          {/* Home Layout - dengan Navbar */}
          <Route path="/" element={<HomeLayout />} />
          
          {/* App Layout - dengan Navbar untuk halaman app */}
          <Route path="/menu" element={<AppLayout><ChatMindMap /></AppLayout>} />
          <Route path="/chat" element={<AppLayout><ChatMindMap /></AppLayout>} />
          <Route path="/gallery" element={<AppLayout><Gallery /></AppLayout>} />
          <Route path="/chat/anonim" element={<AppLayout><ChatAnonimLocalPage /></AppLayout>} />
          <Route path="/suggestion" element={<AppLayout><SuggestionPage /></AppLayout>} />
          
          {/* App Routes - dengan Navbar */}
          <Route path="/profile/:nama" element={<AppLayout><ProfilePage /></AppLayout>} />
          <Route path="/portfolio/:nama" element={<AppLayout><PortfolioPage /></AppLayout>} />
          
          {/* Game Routes - dengan Navbar */}
          <Route path="/game/reme" element={<AppLayout><GameReme /></AppLayout>} />
          <Route path="/game/mines" element={<AppLayout><Mines /></AppLayout>} />
          <Route path="/game/luckywheel" element={<AppLayout><LuckyWheel /></AppLayout>} />
          <Route path="/game" element={<AppLayout><Game /></AppLayout>} />
          <Route path="/leaderboard" element={<AppLayout><Leaderboard /></AppLayout>} />
        </Routes>
      </ErrorBoundary>
    </AuthProvider>
  );
}

