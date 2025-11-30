import React, { useEffect } from "react"
import Home from "./Pages/Home"
import Carousel from "./Pages/Gallery"
import FullWidthTabs from "./Pages/Tabs"
import Footer from "./Pages/Footer"
import ChatAnonimModal from "./components/ChatAnonimModal"
import AOS from "aos"
import "aos/dist/aos.css"

function App() {
	useEffect(() => {
		AOS.init()
		AOS.refresh()
	}, [])

	return (
		<Routes>
			<Home />

			<Route path="/gallery" element={<Carousel />} />
			<Routw path="/Tabs" element={<FullWidthTabs />} />

			<div id="Mesh1"></div>


			<div
				className="lg:mx-[12%] lg:mt-[-5rem] lg:mb-20 hidden lg:block"
				id="ChatAnonim_lg"
				data-aos="fade-up"
				data-aos-duration="1200">
				<Route path="/Chat" element={<ChatAnonimModal />} />
			</div>

			<Footer />
		</>
	)
}

export default App
