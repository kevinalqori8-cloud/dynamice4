// src/components/EnhancedErrorBoundary.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Button, Typography, Paper, Chip } from '@mui/material';
import { ErrorOutline, Refresh, Home, BugReport } from '@mui/icons-material';

class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Enhanced Error Boundary caught:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
      timestamp: new Date().toISOString()
    });

    // Log to external service
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: true
      });
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: this.state.retryCount + 1
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              minHeight: '100vh',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            >
              <Paper
                elevation={10}
                sx={{
                  padding: { xs: 4, md: 6 },
                  borderRadius: 4,
                  textAlign: 'center',
                  maxWidth: 600,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Error Icon */}
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <ErrorOutline
                    sx={{
                      fontSize: 80,
                      color: '#ff4757',
                      mb: 2
                    }}
                  />
                </motion.div>

                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    mb: 2
                  }}
                >
                  🎮 Game Over!
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  paragraph
                  sx={{ mb: 4, fontSize: '1.1rem' }}
                >
                  A critical error occurred in Dynamic E4. Don't worry, we're on it!
                </Typography>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={this.handleReset}
                    sx={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 'bold',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #5a67d8, #6b46c1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    Try Again
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<Home />}
                    onClick={this.handleReload}
                    sx={{
                      borderColor: '#667eea',
                      color: '#667eea',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 'bold',
                      '&:hover': {
                        background: 'rgba(102, 126, 234, 0.1)',
                        borderColor: '#5a67d8',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Reload App
                  </Button>
                </Box>

                {/* Error Details */}
                {this.state.error && (
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      background: '#f8f9fa',
                      borderRadius: 2,
                      textAlign: 'left',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      color: '#e74c3c'
                    }}
                  >
                    <Typography variant="caption" display="block" gutterBottom>
                      <strong>Error:</strong> {this.state.error.toString()}
                    </Typography>
                    <Typography variant="caption" display="block">
                      <strong>ID:</strong> {Math.random().toString(36).substr(2, 9)}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;

