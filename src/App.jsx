import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Gallery from "./Pages/Gallery";
import Tabs from "./Pages/Tabs";
import Footer from "./Pages/Footer";
import ChatPage from "./Pages/ChatPage";
import Navbar from "./components/Navbar";
import SuggestionBox from "./components/SuggestionBox";     // ⬅ baru
import ChatMindMap from "./Pages/ChatMindMap";              // ⬅ baru
import ChatAnonimLocalPage from "./Pages/ChatAnonimLocalPage"; // ⬅ baru
import SuggestionPage from "./Pages/SuggestionPage";
import AOS from "aos";
import "aos/dist/aos.css";
import ProfilePage from "./Pages/ProfilePage";

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
    <Routes>
      <Route path="/" element={<Layout />} />
      <Route path="/chat" element={<ChatMindMap />} />
	<Route path="/chat/anonim" element={<ChatAnonimLocalPage />} />
	<Route path="/suggestion" element={<SuggestionPage />} />
	// App.jsx (tambahan route)
	<Route path="/profile/:nama" element={<ProfilePage />} />

    </Routes>
  );
}

