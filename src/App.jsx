import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import Carousel from "./Pages/Gallery";
import FullWidthTabs from "./Pages/Tabs";
import Footer from "./Pages/Footer";
import ChatAnonimModal from "./components/ChatAnonimModal"; // jendela melayang
import ChatButton from "./components/ChatButton"; // tombol untuk trigger
import AOS from "aos";
import "aos/dist/aos.css";

function Layout() {
	useEffect(() => {
		AOS.init({ duration: 800, once: true });
	}, []);

	return (
		<>
			{/* ---------- HOMEPAGE ---------- */}
			<Home />
			<Carousel />
			<FullWidthTabs />

			{/* ---------- TOMBOL CHAT ---------- */}
			{/* Desktop: di bawah Tabs, floating */}
			<div className="hidden lg:flex justify-center mt-[-3rem] mb-20">
				<ChatButton />
			</div>

			{/* Mobile: sticky di bawah layar */}
			<div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
				<ChatButton className="shadow-lg" />
			</div>

			<div id="Mesh1"></div>
			<Footer />
		</>
	);
}

export default function App() {
	const location = useLocation(); // cek apakah sedang buka modal

	return (
		<>
			{/* semua halaman biasa */}
			<Routes>
				<Route path="/" element={<Layout />} />
				{/* modal chat (bisa diakses dari mana saja) */}
				<Route path="/chat" element={<ChatAnonimModal />} />
			</Routes>

			{/* Portal untuk modal (supaya keluar hirarki root) */}
			<div id="chat-portal" />
		</>
	);
}

