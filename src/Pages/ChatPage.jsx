// src/Pages/ChatPage.jsx
import { useNavigate } from "react-router-dom";
import ChatAnonimContent from "../components/ChatAnonimContent";

export default function ChatPage() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      {/* Header kecil + Back */}
      <header className="flex items-center gap-3 px-4 py-3 text-white">
        <button
          onClick={() => nav(-1)}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition"
        >
          ←
        </button>
        <span className="font-semibold">Obrolan Kelas</span>
      </header>

      {/* Chat area – mungil di desktop, full-width di mobile */}
      <section className="px-4 pb-6">
        <div
          className="mx-auto w-full max-w-sm h-[75vh] rounded-2xl
                     bg-white/10 backdrop-blur-xl border border-white/20
                     shadow-2xl overflow-hidden"
        >
          <ChatAnonimContent />
        </div>
      </section>
    </div>
  );
}

