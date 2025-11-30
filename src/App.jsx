// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import Carousel from "./Pages/Gallery";
import FullWidthTabs from "./Pages/Tabs";
import Footer from "./Pages/Footer";
import ChatAnonimModal from "./components/ChatAnonimModal"; // modal kecil
import ChatButton from "./components/ChatButton"; // tombol trigger
import AOS from "aos";
import "aos/dist/aos.css";

/* ---------- LAYOUT UTAMA (akan selalu ditampilkan) ---------- */
function Layout() {
	useEffect(() => AOS.init({ duration: 800, once: true }), []);
	return (
		<>
			<Home />
			<Carousel />
			<FullWidthTabs />

			{/* tombol trigger chat */}
			<div className="hidden lg:flex justify-center mt-[-3rem] mb-20">
				<ChatButton />
			</div>
			<div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
				<ChatButton className="shadow-lg" />
			</div>

			<div id="Mesh1"></div>
			<Footer />
		</>
	);
}

/* ---------- APP ---------- */
export default function App() {
	return (
		<>
			{/* 1. selalu tampilkan Layout (Home, Gallery, Tabs, Footer) */}
			<Layout />

			{/* 2. modal chat (hanya muncul saat URL = /chat) */}
			<Routes>
				<Route path="/chat" element={<ChatAnonimModal />} />
			</Routes>

			{/* 3. portal untuk modal (render di luar #root) */}
			<div id="chat-portal" />
		</>
	);
}

