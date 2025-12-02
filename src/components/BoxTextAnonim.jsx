// src/components/BoxTextAnonim.jsx
import React, { useState } from "react";
import ChatAnonimLocal from "./ChatAnonimLocal";

export default function BoxTextAnonim() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ======= BOX KECIL (trigger) ======= */}
      <div
        onClick={() => setOpen(true)}
        className="glass-card rounded-2xl p-4 w-40 cursor-pointer hover:scale-105 transition-transform"
      >
        <div className="flex justify-between">
          <img src="/paper-plane.png" alt="" className="w-auto h-6" />
          <img src="/next.png" alt="" className="w-3 h-3" />
        </div>
        <h1 className="text-white text-left font-semibold mt-5 pr-0">Text Anonim</h1>
      </div>

      {/* ======= MODAL GLASS ======= */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          {/* backdrop blur */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

          {/* modal content */}
          <div
            className="relative w-full max-w-sm h-[70vh] rounded-2xl 
                         bg-white/10 backdrop-blur-xl border border-white/20 
                         shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full 
                         bg-white/10 hover:bg-white/20 flex items-center justify-center 
                         text-white text-lg transition"
            >
              ✕
            </button>

            {/* Chat component */}
            <ChatAnonimLocal />
          </div>
        </div>
      )}
    </>
  );
}

