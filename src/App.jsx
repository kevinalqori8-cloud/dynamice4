// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Gallery from "./Pages/Gallery";
import Tabs from "./Pages/Tabs";
import Footer from "./Pages/Footer";
import ChatAnonimModal from "./components/ChatAnonimModal";
import AOS from "aos";
import "aos/dist/aos.css";

function Layout() {
  useEffect(() => AOS.init({ duration: 800, once: true }), []);
  return (
    <>
      <Home />
      <Gallery />
      <Tabs />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <>
      {/* semua halaman */}
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/chat" element={<ChatAnonimModal />} />
      </Routes>

      {/* portal modal tetap di-render supaya bisa muncul di /chat */}
      <div id="chat-portal" />
    </>
  );
}

