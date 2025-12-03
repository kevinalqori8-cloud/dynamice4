// ErrorBoundary.jsx - Tambahkan pengecekan khusus untuk navbar/navigation

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
      isLoading: false,
      progress: 0,
      showPasswordMenu: false,
      shouldRedirect: false,
      loadingComplete: true, // Default true, tidak preload otomatis
      isNavigation: false // Tambahkan state untuk deteksi navigation
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, isLoading: false, loadingComplete: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    
    const safeError = error || new Error("Unknown error");
    const safeErrorInfo = errorInfo || { componentStack: "No stack trace available" };
    
    this.setState({
      error: safeError,
      errorInfo: safeErrorInfo,
      isLoading: false,
      loadingComplete: true
    });
  }

  // Fungsi untuk mengecek apakah ini navigation event
  isNavigationEvent = () => {
    // Cek apakah ini navigasi baru atau error biasa
    const navigationTiming = performance.getEntriesByType('navigation')[0];
    if (navigationTiming && navigationTiming.type === 'reload') {
      return true;
    }
    
    // Cek apakah ada perubahan URL (indikasi navigation)
    const currentUrl = window.location.href;
    const isNewPage = !sessionStorage.getItem('currentUrl') || sessionStorage.getItem('currentUrl') !== currentUrl;
    sessionStorage.setItem('currentUrl', currentUrl);
    
    return isNewPage;
  };

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showPasswordMenu: false,
      shouldRedirect: false
    });
  };

  handlePasswordSubmit = () => {
    const { passwordInput } = this.state;
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
      
      // Tampilkan notifikasi
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

  // Auto redirect untuk kasus-kasus tertentu
  componentDidUpdate(prevProps, prevState) {
    // Jika ini navigation event dan tidak ada error, lanjutkan
    if (this.state.shouldRedirect && 
        !this.state.hasError && 
        !this.state.isLoading && 
        this.state.loadingComplete) {
      
      // Cek apakah ini navigasi biasa (bukan error)
      if (!this.state.hasError && this.isNavigationEvent()) {
        this.setState({ shouldRedirect: false });
        return;
      }
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

    // Skip preload untuk navigation events
    if (!hasError && !isLoading && loadingComplete) {
      return this.props.children;
    }

    // Jika error, tampilkan error boundary
    if (hasError) {
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
          {/* Error Boundary Content */}
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
            {/* Error State */}
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

              {/* Error Details (Only if password correct) */}
              <AnimatePresence>
                {showSecret && this.state.error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-6"
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={this.toggleDetails}
                      sx={{ 
                        mb: 2,
                        borderColor: 'rgba(138, 43, 226, 0.5)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          borderColor: '#8a2be2',
                          background: 'rgba(138, 43, 226, 0.1)'
                        }
                      }}
                    >
                      {this.state.showDetails ? 'Sembunyikan Detail' : 'Tampilkan Error Detail'}
                    </Button>
                    
                    {this.state.showDetails && (
                      <Paper 
                        sx={{ 
                          p: 3, 
                          background: 'rgba(0, 0, 0, 0.7)',
                          border: '1px solid rgba(255, 0, 0, 0.3)',
                          textAlign: 'left',
                          fontSize: '0.8rem',
                          maxHeight: '300px',
                          overflow: 'auto'
                        }}
                      >
                        <Typography variant="h6" sx={{ color: '#ff6b6b', mb: 2 }}>
                          🔍 Developer Error Details:
                        </Typography>
                        <Typography component="div" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.8)' }}>
                          <strong>🚨 Error:</strong> {this.safeToString(error)}
                        </Typography>
                        {errorInfo && (
                          <Typography component="div" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            <strong>📍 Stack Trace:</strong>
                            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.7rem', mt: 1 }}>
                              {this.safeGetStack(errorInfo)}
                            </pre>
                          </Typography>
                        )}
                      </Paper>
                    )}
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
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

