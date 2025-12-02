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
      isLoading: true, // Tambahkan state loading
      progress: 0, // Progress bar
      showPasswordMenu: false // Menu untuk unlock error
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
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
        this.setState({ isLoading: false });
      }
      this.setState({ progress });
    }, 200);
  };

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showPasswordMenu: false
    });
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  handlePasswordSubmit = () => {
    const { passwordInput } = this.state;
    if (passwordInput === "DEV2024") { // Password untuk unlock error menu
      this.setState({ 
        showSecret: true, 
        showPasswordMenu: false,
        passwordInput: ""
      });
      // Tampilkan error di console untuk developer
      console.log('=== DEVELOPER ERROR UNLOCKED ===');
      console.log('Error:', this.state.error?.toString());
      console.log('Stack:', this.state.errorInfo?.componentStack);
      console.log('=================================');
    } else {
      alert("❌ Password salah! Hubungi developer.");
      this.setState({ passwordInput: "" });
    }
  };

  // Secret area click handler
  handleSecretClick = () => {
    if (this.state.hasError) {
      this.setState({ showPasswordMenu: true });
    }
  };

  // Secret button (invisible area)
  showSecretError = () => {
    if (this.state.hasError && !this.state.showPasswordMenu) {
      this.setState({ showPasswordMenu: true });
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
      showPasswordMenu
    } = this.state;

    if (hasError || isLoading) {
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

                <motion.p 
                  className="text-white/60 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {Math.round(progress)}% • {hasError ? "Error terdeteksi" : "Loading..."}
                </motion.p>
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
                  Web Loading ...
                </motion.h2>
                
                <motion.p 
                  className="text-white/70 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Loading Pagee
                </motion.p>

                {/* Hidden Password Unlock Area */}
                <motion.div
                  className="mb-6 cursor-pointer"
                  onClick={this.showSecretError}
                  whileHover={{ scale: 1.02 }}
                  title="Area rahasia - klik untuk unlock menu error"
                >
                  <div className="w-full h-2 bg-white/5 rounded-full mb-2"></div>
                  <p className="text-xs text-white/40">Area developer - klik untuk unlock</p>
                </motion.div>

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
                            <strong>🚨 Error:</strong> {this.state.error.toString()}
                          </Typography>
                          {this.state.errorInfo && (
                            <Typography component="div" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              <strong>📍 Stack Trace:</strong>
                              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.7rem', mt: 1 }}>
                                {this.state.errorInfo.componentStack}
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
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

