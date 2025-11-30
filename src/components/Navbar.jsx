// src/components/Navbar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Gallery", path: "/#Gallery" },
  { label: "Schedule", path: "/#Tabs" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  // animasi AOS saat menu muncul
  React.useEffect(() => {
    AOS.refresh();
  }, [open]);

  return (
    <>
      {/* ======= DESKTOP ======= */}
      <header
        className="hidden lg:flex items-center justify-between px-8 py-4 rounded-full 
                     glass-card max-w-5xl mx-auto mt-6"
        data-aos="fade-down"
        data-aos-duration="800"
      >
        <img
          src="/LogoPHI.png"
          alt="Logo"
          className="w-11 h-11 rounded-full shadow-md"
        />

        <nav className="flex items-center gap-6">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.path}
              className="text-white/90 hover:text-white font-medium
                         relative after:content-[''] after:absolute after:left-0 
                         after:-bottom-1 after:w-0 after:h-0.5 after:bg-gradient-to-r 
                         after:from-purple-400 after:to-pink-400 
                         hover:after:w-full after:transition-all after:duration-300"
            >
              {l.label}
            </a>
          ))}
          {/* Chat button */}
          <button
            onClick={() => nav("/chat")}
            className="ml-4 px-4 py-2 rounded-full glass-button text-sm"
          >
            💬 Text Anonim
          </button>
        </nav>
      </header>

      {/* ======= MOBILE ======= */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-40"
        data-aos="fade-down"
        data-aos-duration="600"
      >
        <div className="mx-4 mt-4 mb-2 flex items-center justify-between rounded-full glass-card px-4 py-3">
          {/* Left hamburger */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="w-9 h-9 flex items-center justify-center rounded-full 
                       bg-white/10 hover:bg-white/20 transition"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>

          {/* Center welcome */}
          <div className="text-center">
            <div className="text-[0.65rem] text-white/80">Hi, visitor!</div>
            <div className="font-bold text-white text-sm">WELCOME</div>
          </div>

          {/* Right avatar */}
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <img src="/user.svg" alt="User" className="w-5 h-5" />
          </div>
        </div>

        {/* Slide menu */}
        <div
          className={`mx-4 overflow-hidden transition-all duration-300 ease-in-out ${
            open ? "max-h-96" : "max-h-0"
          }`}
        >
          <nav
            className="mt-2 rounded-2xl glass-card px-4 py-3 space-y-3"
            data-aos="fade-in"
            data-aos-duration="400"
          >
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.path}
                onClick={() => setOpen(false)}
                className="block text-white/90 hover:text-white font-medium"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                nav("/chat");
              }}
              className="w-full mt-2 glass-button py-2 rounded-full text-sm"
            >
              💬 Text Anonim
            </button>
          </nav>
        </div>
      </header>

      {/* Overlay backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}

