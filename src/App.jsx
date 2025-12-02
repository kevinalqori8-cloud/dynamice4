import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Gallery from "./Pages/Gallery";
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
import LuckyWheel from "./Pages/game/LuckyWheel"; // Game baru
import { AuthProvider } from "./context/AuthContext";
import Leaderboard from "./components/Leaderboard";
import { Analytics } from "@vercel/analytics/next"

function Layout() {
  useEffect(() => AOS.init({ duration: 800, once: true }), []);
  return (
    <>
      <Navbar />
      <Home />
      <Gallery />
      <Tabs />
      <SuggestionBox />
      <Footer />
    </>
  );
}

export default function App() {
  return (
	<Analytics>
	<AuthProvider>
    <Routes>
      <Route path="/" element={<Layout />} />
      <Route path="/menu" element={<ChatMindMap />} />
      <Route path="/chat" element={<ChatMindMap />} />
      <Route path="/chat/anonim" element={<ChatAnonimLocalPage />} />
      <Route path="/suggestion" element={<SuggestionPage />} />
      
      {/* App Routes */}
      <Route path="/profile/:nama" element={<ProfilePage />} />
      <Route path="/portfolio/:nama" element={<PortfolioPage />} />
      
      {/* Game Routes */}
      <Route path="/game/reme" element={<GameReme />} />
      <Route path="/game/mines" element={<Mines />} />
      <Route path="/game/luckywheel" element={<LuckyWheel />} /> {/* Game baru */}
      <Route path="/game" element={<Game />} />
	<Route path="/leaderboard" element={<Leaderboard />} />
    </Routes>
	</AuthProvider>
	</Analytics>
  );
}
