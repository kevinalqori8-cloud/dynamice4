// src/Pages/ChatAnonimLocalPage.jsx
import { useNavigate } from "react-router-dom";
import ChatAnonimLocal from "../components/ChatAnonimLocal";

export default function ChatAnonimLocalPage() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      <header className="flex items-center gap-3 px-4 py-3 text-white">
        <button
          onClick={() => nav(-1)}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
        >
          ←
        </button>
        <span className="font-semibold">Chat Anonim</span>
      </header>

      <section className="px-4 pb-6">
        <div className="mx-auto w-full max-w-sm h-[75vh] rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
          <ChatAnonimLocal />
        </div>
      </section>
    </div>
  );
}

