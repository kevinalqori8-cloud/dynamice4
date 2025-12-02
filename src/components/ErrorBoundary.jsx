import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Typography, Button, Paper, TextField, InputAdornment } from "@mui/material";
import { Refresh as RefreshIcon, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import "./loadinf/ErrorBoundary.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false,
      showSecret: false,
      passwordInput: "",
      passwordVisible: false,
      isLoading: true,
      progress: 0,
      showPasswordMenu: false,
      isFunctionValid: true,
      shouldRedirect: false, // Tambahkan state untuk redirect
      loadingComplete: false // Tambahkan state untuk tracking loading selesai
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, isLoading: false }; // Stop loading saat error
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    
    const safeError = error || new Error("Unknown error");
    const safeErrorInfo = errorInfo || { componentStack: "No stack trace available" };
    
    this.setState({
      error: safeError,
      errorInfo: safeErrorInfo,
      isLoading: false, // Stop loading saat error
      loadingComplete: true
    });
  }

  componentDidMount() {
    // Simulasi loading progress
    this.simulateLoading();
  }

  simulateLoading = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Set loading complete dan tunggu sebentar sebelum lanjut
        this.setState({ 
          loadingComplete: true,
          isLoading: false 
        }, () => {
          // Delay kecil sebelum lanjut agar user bisa melihat 100%
          setTimeout(() => {
            if (!this.state.hasError) {
              this.setState({ shouldRedirect: true });
            }
          }, 800); // Delay 0.8 detik
        });
        
        return;
      }
      this.setState({ progress });
    }, 200);
  };

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showPasswordMenu: false,
      isLoading: true,
      progress: 0,
      loadingComplete: false,
      shouldRedirect: false
    });
    
    // Restart loading simulation
    this.simulateLoading();
  };

  handlePasswordSubmit = () => {
    const { passwordInput } = this    const { passwordInput } = this.state;
    if (passwordInput === "DEV2024") {
      this.setState({ 
        showSecret: true, 
        showPasswordMenu: false,
        passwordInput: ""
      });
      
      this.displayErrorSafely();
    } else {
      alert("❌ Password salah! Hubungi developer.");
      this.setState({ passwordInput: "" });
    }
  };

  displayErrorSafely = () => {
    try {
      const { error, errorInfo } = this.state;
      
      console.log('=== DEVELOPER ERROR UNLOCKED ===');
      console.log('Error:', error?.toString?.() || 'Unknown error');
      console.log('Stack:', errorInfo?.componentStack || 'No stack trace');
      console.log('=================================');
      
      this.showDeveloperNotification();
    } catch (displayError) {
      console.error('Error displaying error:', displayError);
    }
  };

  showDeveloperNotification = () => {
    const notification = document.createElement('div');
    notification.className = 'dev-notification';
    notification.textContent = '🔓 Developer mode unlocked! Check console for details.';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  safeToString = (obj) => {
    try {
      if (obj === null || obj === undefined) return "Unknown error";
      if (typeof obj.toString === 'function') return obj.toString();
      if (typeof obj.message === 'string') return obj.message;
      return JSON.stringify(obj);
    } catch (e) {
      return "Error displaying error details";
    }
  };

  safeGetStack = (errorInfo) => {
    try {
      if (!errorInfo) return "No stack trace available";
      if (typeof errorInfo.componentStack === 'string') return errorInfo.componentStack;
      if (typeof errorInfo.stack === 'string') return errorInfo.stack;
      return "Stack trace not available";
    } catch (e) {
      return "Error reading stack trace";
    }
  };

  // Auto redirect saat loading complete dan tidak ada error
  componentDidUpdate(prevProps, prevState) {
    if (this.state.shouldRedirect && !this.state.hasError && !this.state.isLoading) {
      // Reset state dan lanjutkan render children
      this.setState({ shouldRedirect: false }, () => {
        // Force update untuk lanjutkan ke children
        this.forceUpdate();
      });
    }
  };

  render() {
    const { 
      hasError, 
      error, 
      errorInfo, 
      showDetails, 
      showSecret, 
      passwordInput, 
      passwordVisible,
      isLoading,
      progress,
      showPasswordMenu,
      shouldRedirect,
      loadingComplete
    } = this.state;

    // Auto redirect jika loading complete dan tidak ada error
    if (shouldRedirect && !hasError && loadingComplete) {
      // Reset state dan lanjutkan
      return this.props.children;
    }

    if (hasError || isLoading || !loadingComplete) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a0033 0%, #330066 50%, #000000 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Animated Background */}
          <div className="infinity-background">
            <div className="infinity-track">
              <div className="infinity-dot"></div>
              <div className="infinity-dot"></div>
            </div>
          </div>

          <Paper 
            elevation={10} 
            sx={{ 
              p: 8, 
              maxWidth: 600, 
              textAlign: 'center',
              background: 'rgba(20, 0, 40, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(138, 43, 226, 0.3)',
              borderRadius: '24px',
              position: 'relative',
              zIndex: 10
            }}
          >
              {/* Loading State */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Animated Logo */}
                  <motion.div 
                    className="relative mb-6"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="infinity-logo-container">
                      <img 
                        src="/pp.png" 
                        alt="Logo" 
                        className="infinity-logo"
                      />
                      <div className="infinity-trail"></div>
                    </div>
                  </motion.div>

                  <motion.h1 
                    className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    🚀 Loading Experience
                  </motion.h1>
                  
                  <motion.p 
                    className="text-white/70 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {hasError 
                      ? "Oops! Sepertinya ada masalah. Sedang memproses..." 
                      : "Memuat pengalaman digital yang luar biasa..."
                    }
                  </motion.p>

                  {/* Progress Bar */}
                  <motion.div 
                    className="w-full bg-white/10 rounded-full h-3 mb-6 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>

                  {/* Status teks yang berubah sesuai kondisi */}
                  <motion.p 
                    className="text-white/60 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    {Math.round(progress)}% • {hasError ? "Error terdeteksi" : "Loading..."}
                    {loadingComplete && !hasError && " ✓ Complete - Redirecting..."}
                  </motion.p>

                  {/* Tombol skip untuk developer */}
                  {!hasError && (
                    <motion.button
                      onClick={() => this.setState({ shouldRedirect: true })}
                      className="mt-4 text-xs text-white/50 hover:text-white underline"
                      whileHover={{ scale: 1.05 }}
                    >
                      Skip loading (developer)
                    </motion.button>
                  )}
                </motion.div>
              )}

              {/* Error State */}
              {hasError && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  {/* Error Icon */}
                  <motion.div 
                    className="relative mb-6"
                    animate={{ 
                      rotate: [0, 10, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-3xl">
                      ⚠️
                    </div>
                    <motion.div
                      className="absolute -top-2 -right-2 text-2xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ❌
                    </motion.div>
                  </motion.div>

                  <motion.h2 
                    className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    System Error Detected
                  </motion.h2>
                  
                  <motion.p 
                    className="text-white/70 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Terdeteksi masalah dalam sistem. Jangan khawatir, kami sedang menanganinya.
                  </motion.p>

                  {/* Password Unlock Menu */}
                  <AnimatePresence>
                    {showPasswordMenu && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.9 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.9 }}
                        className="mb-6 bg-white/5 rounded-xl p-4 border border-purple-400/30"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            Developer Access
                          </h3>
                          <button
                            onClick={() => this.setState({ showPasswordMenu: false })}
                            className="text-white/60 hover:text-white"
                          >
                            ✕
                          </button>
                        </div>
                        
                        <p className="text-white/60 text-sm mb-3">
                          Masukkan password developer untuk melihat detail error
                        </p>

                        <div className="space-y-3">
                          <TextField
                            type={passwordVisible ? "text" : "password"}
                            value={passwordInput}
                            onChange={(e) => this.setState({ passwordInput: e.target.value })}
                            placeholder="Developer Password"
                            size="small"
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': {
                                  borderColor: 'rgba(138, 43, 226, 0.5)',
                                },
                                '&:hover fieldset': {
                                  borderColor: '#8a2be2',
                                },
                              },
                            }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <button
                                    onClick={() => this.setState({ passwordVisible: !passwordVisible })}
                                    className="text-white/60 hover:text-white"
                                  >
                                    {passwordVisible ? <VisibilityOff /> : <Visibility />}
                                  </button>
                                </InputAdornment>
                              ),
                            }}
                          />
                          
                          <Button
                            variant="contained"
                            onClick={this.handlePasswordSubmit}
                            fullWidth
                            sx={{
                              background: 'linear-gradient(45deg, #8a2be2, #9932cc)',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #9932cc, #8a2be2)',
                              }
                            }}
                          >
                            Unlock Error Menu
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={<RefreshIcon />}
                      onClick={this.resetError}
                      sx={{
                        background: 'linear-gradient(45deg, #8a2be2, #9932cc)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #9932cc, #8a2be2)',
                        }
                      }}
                    >
                      Lanjutkan
                    </Button>
                    
                    <Button
                      variant="outlined"
                      onClick={() => window.location.reload()}
                      sx={{
                        borderColor: 'rgba(138, 43, 226, 0.5)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          borderColor: '#8a2be2',
                          background: 'rgba(138, 43, 226, 0.1)'
                        }
                      }}
                    >
                      Refresh Page
                    </Button>
                  </Box>
                </motion.div>
              )}
            </Paper>
          </Box>
        );
      }

      return this.props.children;
  }
}

export default ErrorBoundary;

