// src/App.jsx
import React, { useEffect } from "react";
import Home from "./Pages/Home";
import Carousel from "./Pages/Gallery";
import FullWidthTabs from "./Pages/Tabs";
import Footer from "./Pages/Footer";
import Chat from "./components/ChatAnonim"; // pakai versi lama tanpa modal
import AOS from "aos";
import "aos/dist/aos.css";

function App() {
	useEffect(() => {
		AOS.init({ duration: 800, once: true });
	}, []);

	return (
		<>
			<Home />
			<Carousel />
			<FullWidthTabs />

			{/* Chat versi lama (bukan modal) */}
			<div
				className="lg:mx-[12%] lg:mt-[-5rem] lg:mb-20 hidden lg:block"
				id="ChatAnonim_lg"
				data-aos="fade-up"
				data-aos-duration="1200"
			>
				<Chat />
			</div>

			{/* Mobile: tampilkan juga Chat (bukan modal) */}
			<div className="lg:hidden px-4 py-6">
				<Chat />
			</div>

			<div id="Mesh1"></div>
			<Footer />
		</>
	);
}

export default App;

