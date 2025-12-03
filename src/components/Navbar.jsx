import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { daftarSiswa } from "../data/siswa";
import LoginPopup from "./LoginPopup";
import { userService } from "../service/firebaseService";

// Import framer-motion dengan error handling
let motion, AnimatePresence;
try {
  const framerMotion = require("framer-motion");
  motion = framerMotion.motion;
  AnimatePresence = framerMotion.AnimatePresence;
} catch (error) {
  console.warn("Framer-motion not available, using fallback animations");
  // Fallback components
  motion = {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  };
  AnimatePresence = ({ children }) => <>{children}</>;
}

// Import AuthContext dengan error handling
let useAuth;
try {
  const authContext = require("../context/AuthContext");
  useAuth = authContext.useAuth;
} catch (error) {
  console.warn("AuthContext not available, using fallback");
  useAuth = () => ({ user: null, logout: () => {} });
}

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Gallery", path: "/gallery" },
  { label: "Schedule", path: "/#Tabs" },
  { label: "Leaderboard", path: "/leaderboard" },
  { label: "Games", path: "/game" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const authContext = useAuth();
  const { user, logout } = authContext || { user: null, logout: () => {} };
  
  const [query, setQuery] = useState("");
  const [hasil, setHasil] = useState([]);
  const [openLogin, setOpenLogin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animationEnabled, setAnimationEnabled] = useState(true);

  useEffect(() => {
    // Check if framer-motion is working
    setAnimationEnabled(typeof motion !== 'undefined' && motion.div !== motion.button);
    
    checkFirebaseLogin();
    
    // Event listener dengan error handling
    const handleLoginStatusChanged = () => {
      checkFirebaseLogin();
    };
    
    window.addEventListener('loginStatusChanged', handleLoginStatusChanged);
    
    return () => {
      window.removeEventListener('loginStatusChanged', handleLoginStatusChanged);
    };
  }, []);

  const checkFirebaseLogin = async () => {
    try {
      setLoading(true);
      const localUser = localStorage.getItem('currentUser');
      if (localUser) {
        const userData = JSON.parse(localUser);
        if (userService && typeof userService.getUserData === 'function') {
          const firebaseUser = await userService.getUserData(userData.nama);
          if (firebaseUser) {
            setCurrentUser(firebaseUser);
          } else {
            localStorage.removeItem('currentUser');
            setCurrentUser(null);
          }
        } else {
          // Fallback jika userService tidak tersedia
          setCurrentUser(userData);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const cari = (e) => {
    const q = e.target.value;
    setQuery(q);
    if (!q) return setHasil([]);
    const filter = daftarSiswa.filter((s) =>
      s.nama.toLowerCase().includes(q.toLowerCase())
    );
    setHasil(filter.slice(0, 5));
  };

  const handleLogin = async (userData) => {
    try {
      setOpenLogin(false);
      
      // Validasi userService
      if (!userService || typeof userService.saveUserData !== 'function') {
        console.warn("UserService not available, using localStorage only");
        localStorage.setItem('currentUser', JSON.stringify(userData));
        setCurrentUser(userData);
        navigate("/game");
        return;
      }
      
      // Simpan ke Firebase
      await userService.saveUserData(userData.nama, {
        ...userData,
        lastLogin: new Date().toISOString(),
        isOnline: true
      });
      
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('lastLoginTime', new Date().toISOString());
      
      setCurrentUser(userData);
      navigate("/game");
    } catch (error) {
      console.error("Login error:", error);
      alert("❌ Login gagal: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      if (currentUser && userService && typeof userService.saveUserData === 'function') {
        await userService.saveUserData(currentUser.nama, {
          isOnline: false,
          lastLogout: new Date().toISOString()
        });
      }
      
      if (logout && typeof logout === 'function') {
        logout();
      }
      
      localStorage.removeItem('currentUser');
      localStorage.removeItem('lastLoginTime');
      setCurrentUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Fixed: Proper fallback motion components
  const MotionDiv = animationEnabled ? motion.div : ({ children, ...props }) => <div {...props}>{children}</div>;
  const MotionButton = animationEnabled ? motion.button : ({ children, ...props }) => <button {...props}>{children}</button>;

  // Animation props dengan fallback
  const getMotionProps = (animationType) => {
    if (!animationEnabled) return {};
    
    switch (animationType) {
      case 'hover':
        return {
          whileHover: { scale: 1.05 },
          whileTap: { scale: 0.95 }
        };
      case 'rotate':
        return {
          animate: { rotate: 360 },
          transition: { duration: 8, repeat: Infinity, ease: "linear" }
        };
      case 'menu':
        return {
          initial: { opacity: 0, y: -10, scale: 0.9 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -10, scale: 0.9 },
          transition: { duration: 0.2 }
        };
      case 'slide':
        return {
          whileHover: { x: 5 }
        };
      default:
        return {};
    }
  };

  // Bagian Kiri Navbar
  const BrandSection = () => (
    <MotionDiv 
      className="flex items-center gap-3 cursor-pointer"
      onClick={() => navigate("/menu")}
      {...getMotionProps('hover')}
    >
      <MotionDiv 
        className="relative"
        {...getMotionProps('rotate')}
      >
        <img 
          src="/LogoPHI.png" 
          alt="Logo" 
          className="w-10 h-10 rounded-full border-2 border-white/30 shadow-lg"
        />
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-sm opacity-30"></div>
      </MotionDiv>
      
      <div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          GameE4
        </h1>
        <p className="text-xs text-white/60">XE-4 Gaming Portal</p>
      </div>
    </MotionDiv>
  );

  if (loading) {
    return (
      <header className="hidden lg:flex items-center justify-between px-6 py-3 rounded-full glass-card max-w-5xl mx-auto mt-6">
        <BrandSection />
        <div className="flex-1 max-w-xs mx-4">
          <div className="w-full bg-white/10 h-8 rounded-full animate-pulse"></div>
        </div>
        <div className="w-20 h-8 bg-white/10 rounded-full animate-pulse"></div>
      </header>
    );
  }

  return (
    <>
      {/* Desktop */}
      <header className="hidden lg:flex items-center justify-between px-6 py-3 rounded-full glass-card max-w-5xl mx-auto mt-6">
        <BrandSection />
        
        <div className="relative flex-1 max-w-xs mx-4">
          <input
            type="text"
            value={query}
            onChange={cari}
            placeholder="Cari siswa..."
            className="w-full bg-white/10 placeholder-white/60 px-3 py-2 rounded-full text-sm outline-none border border-white/20 focus:border-white/40"
          />
          {hasil.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-lg glass-card p-2 space-y-1 text-sm text-white">
              {hasil.map((s) => (
                <button
                  key={s.nama}
                  onClick={() => {
                    navigate(`/portfolio/${encodeURIComponent(s.nama)}`);
                    setQuery(""); setHasil([]);
                  }}
                  className="w-full text-left px-2 py-1 rounded hover:bg-white/10"
                >
                  {s.nama}
                </button>
              ))}
            </div>
          )}
        </div>

        {currentUser ? (
          <div className="relative">
            <MotionButton
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 glass-button px-4 py-2 rounded-full text-sm"
              {...getMotionProps('hover')}
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-xs font-bold">
                {currentUser.nama.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline">{currentUser.nama.split(' ')[0]}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </MotionButton>

            {animationEnabled ? (
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    className="absolute right-0 top-full mt-2 w-48 rounded-lg glass-card p-2 space-y-1 text-sm text-white z-50"
                    {...getMotionProps('menu')}
                  >
                    <MenuItems />
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg glass-card p-2 space-y-1 text-sm text-white z-50">
                  <MenuItems />
                </div>
              )
            )}
          </div>
        ) : (
          <MotionButton
            onClick={() => setOpenLogin(true)}
            className="glass-button px-4 py-2 rounded-full text-sm"
            {...getMotionProps('hover')}
          >
            Login
          </MotionButton>
        )}
      </header>

      {/* Mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div className="flex items-center justify-between rounded-full glass-card px-4 py-3">
          <MotionDiv 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/menu")}
            {...getMotionProps('hover')}
          >
            <MotionDiv 
              className="relative"
              {...getMotionProps('rotate')}
            >
              <img 
                src="/LogoPHI.png" 
                alt="Logo" 
                className="w-8 h-8 rounded-full border border-white/30 shadow-lg"
              />
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-sm opacity-30"></div>
            </MotionDiv>
            <div>
              <h1 className="text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                GameE4
              </h1>
            </div>
          </MotionDiv>

          <div className="relative flex-1 mx-3">
            <input
              type="text"
              value={query}
              onChange={cari}
              placeholder="Cari siswa..."
              className="w-full bg-white/10 placeholder-white/60 px-3 py-2 rounded-full text-sm outline-none border border-white/20"
            />
            {hasil.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-lg glass-card p-2 space-y-1 text-sm text-white max-h-40 overflow-y-auto">
                {hasil.map((s) => (
                  <button
                    key={s.nama}
                    onClick={() => {
                      navigate(`/portfolio/${encodeURIComponent(s.nama)}`);
                      setQuery(""); setHasil([]);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-white/10"
                  >
                    {s.nama}
                  </button>
                ))}
              </div>
            )}
          </div>

          {currentUser ? (
            <MotionButton
              onClick={() => navigate(`/portfolio/${encodeURIComponent(currentUser.nama)}`)}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center"
              title={`Portfolio ${currentUser.nama}`}
              {...getMotionProps('hover')}
            >
              <span className="text-xs font-bold text-white">
                {currentUser.nama.charAt(0).toUpperCase()}
              </span>
            </MotionButton>
          ) : (
            <MotionButton
              onClick={() => setOpenLogin(true)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              title="Login"
              {...getMotionProps('hover')}
            >
              <img src="/user.svg" alt="User" className="w-5 h-5" />
            </MotionButton>
          )}
        </div>
      </header>

      {/* Login Popup */}
      {animationEnabled ? (
        <AnimatePresence>
          {openLogin && (
            <LoginPopup 
              onClose={() => setOpenLogin(false)} 
              onLogin={handleLogin}
            />
          )}
        </AnimatePresence>
      ) : (
        openLogin && (
          <LoginPopup 
            onClose={() => setOpenLogin(false)} 
            onLogin={handleLogin}
          />
        )
      )}
    </>
  );

  // Component untuk menu items
  function MenuItems() {
    const items = [
      { label: '📁 Portfolio', action: () => navigate(`/portfolio/${encodeURIComponent(currentUser.nama)}`) },
      { label: '🎮 Games', action: () => navigate("/game") },
      { label: '🏆 Leaderboard', action: () => navigate("/leaderboard") },
      { label: '🚪 Logout', action: handleLogout, className: 'text-red-400' }
    ];

    return items.map((item, index) => (
      animationEnabled ? (
        <motion.button
          key={index}
          onClick={() => {
            item.action();
            setShowProfileMenu(false);
          }}
          className={`w-full text-left px-3 py-2 rounded hover:bg-white/10 flex items-center gap-2 ${item.className || ''}`}
          {...getMotionProps('slide')}
        >
          {item.label}
        </motion.button>
      ) : (
        <button
          key={index}
          onClick={() => {
            item.action();
            setShowProfileMenu(false);
          }}
          className={`w-full text-left px-3 py-2 rounded hover:bg-white/10 flex items-center gap-2 ${item.className || ''}`}
        >
          {item.label}
        </button>
      )
    ));
  }
}

