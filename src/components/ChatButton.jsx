/* src/components/ChatButton.jsx */
import { useNavigate } from "react-router-dom";

export default function ChatButton({ className = "" }) {
	const nav = useNavigate();
	return (
		<button
			onClick={() => nav("/chat")}
			className={`glass-button px-4 py-2 rounded-full text-white font-semibold ${className}`}
		>
			Text Anonim
		</button>
	);
}

