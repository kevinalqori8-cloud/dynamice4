/* components/ChatAnonimModal.jsx */
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import ChatAnonimContent from "./ChatAnonimContent"; // logic chat kita pisah
import { useNavigate } from "react-router-dom";

const portalRoot = document.getElementById("chat-portal"); // taruh di index.html

export default function ChatAnonimModal() {
  const nav = useNavigate();

  useEffect(() => {
    // lock body scroll saat modal terbuka
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={() => nav(-1)} // klik backdrop → tutup
    >
      {/* backdrop gelap tipis */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* window kecil */}
      <div
        className="relative w-full max-w-[320px] h-[65vh] flex flex-col rounded-2xl
                   bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl
                   overflow-hidden"
        onClick={(e) => e.stopPropagation()} // jangan tutup saat klik dalam window
      >
        {/* tombol X */}
        <button
          onClick={() => nav(-1)}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center
                     text-white/80 hover:text-white
                     bg-white/10 hover:bg-white/20 rounded-full transition"
        >
          ✕
        </button>

        {/* konten chat */}
        <ChatAnonimContent />
      </div>
    </div>,
    portalRoot
  );
}

