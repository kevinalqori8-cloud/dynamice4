// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Gallery from "./Pages/Gallery";
import Tabs from "./Pages/Tabs";
import Footer from "./Pages/Footer";
import ChatPage from "./Pages/ChatPage"; // halaman khusus chat
import Navbar from "./components/Navbar";
import AOS from "aos";
import "aos/dist/aos.css";
import SuggestionChat from "./Pages/SuggestionPage"; // kompon suggestion (editor)

function Layout() {
  useEffect(() => AOS.init({ duration: 800, once: true }), []);
  return (
    <>
      <Navbar />
      <Home />
      <Gallery />
	<SuggestionBox />
      <Tabs />
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
    </Routes>
  );
}

