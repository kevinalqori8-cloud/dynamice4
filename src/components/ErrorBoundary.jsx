import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import './loadinf/ErrorBoundary.css'; // Tambahkan file CSS untuk animasi

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false,
      showSecret: false
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

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  // Secret function untuk developer
  showSecretError = () => {
    this.setState({ showSecret: true });
    console.log('=== DEVELOPER SECRET ERROR INFO ===');
    console.log('Error:', this.state.error?.toString());
    console.log('Stack:', this.state.errorInfo?.componentStack);
    console.log('=====================================');
  };

  render() {
    if (this.state.hasError) {
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
          {/* Background animasi infinity */}
          <div className="infinity-background">
            <div className="infinity-track">
              <div className="infinity-dot"></div>
              <div className="infinity-dot"></div>
            </div>
          </div>

          <Paper 
            elevation={10} 
            sx={{ 
              p: 6, 
              maxWidth: 500, 
              textAlign: 'center',
              background: 'rgba(20, 0, 40, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(138, 43, 226, 0.3)',
              borderRadius: '20px',
              position: 'relative',
              zIndex: 10
            }}
          >
            {/* Logo infinity berputar */}
            <Box sx={{ mb: 4, position: 'relative' }}>
              <div className="infinity-logo-container">
                <img 
                  src="/pp.png" 
                  alt="Logo" 
                  className="infinity-logo"
                />
                <div className="infinity-trail"></div>
              </div>
            </Box>

            <Typography variant="h4" sx={{ 
              mb: 2, 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #8a2be2, #ff6b6b, #8a2be2)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient-shift 3s ease infinite'
            }}>
              Web Loading ...
            </Typography>
            
            <Typography variant="body1" sx={{ 
              mb: 4, 
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: 1.6
            }}>
              Mohon bersabar ini tuh ngelag ..! 
              Silahkan Refreshshshshshshshshshshshshshshsh :)
            </Typography>

            {this.state.error && (
              <Box sx={{ mb: 4 }}>
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
                  {this.state.showDetails ? 'Hide Details' : 'Show Error Details'}
                </Button>
                
                {this.state.showDetails && (
                  <Paper 
                    sx={{ 
                      p: 2, 
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(255, 0, 0, 0.3)',
                      textAlign: 'left',
                      fontSize: '0.8rem',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}
                  >
                    <Typography variant="h6" sx={{ color: '#ff6b6b', mb: 1 }}>
                      Technical Details:
                    </Typography>
                    <Typography component="div" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.8)' }}>
                      <strong>Error:</strong> {this.state.error.toString()}
                    </Typography>
                    {this.state.errorInfo && (
                      <Typography component="div" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        <strong>Stack Trace:</strong>
                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.7rem', mt: 1 }}>
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </Typography>
                    )}
                  </Paper>
                )}
              </Box>
            )}

            {/* Secret button (invisible) - klik di area kosong di atas logo */}
            <Box 
              sx={{ 
                position: 'absolute',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 100,
                height: 20,
                cursor: 'pointer',
                zIndex: 20
              }}
              onClick={this.showSecretError}
              title="" // Kosongkan title untuk benar-benar invisible
            />

            {this.state.showSecret && (
              <Box sx={{ 
                position: 'fixed',
                top: 20,
                right: 20,
                background: 'rgba(0, 0, 0, 0.9)',
                color: '#00ff00',
                p: 2,
                borderRadius: '5px',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                zIndex: 1000
              }}>
                🔍 Secret Error Info Copied to Console!
              </Box>
            )}

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
                Reset Application
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
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Export yang bener! Dipindahkan ke luar class
export default ErrorBoundary;

