// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { CircularProgress, Box, Button, Typography } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// 🎯 Tema yang konsisten untuk semua game
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8a2be2',
      light: '#a052f5',
      dark: '#6a1b9a',
    },
    secondary: {
      main: '#00bcd4',
      light: '#4dd0e1',
      dark: '#0097a7',
    },
    background: {
      default: '#0a0a0a',
      paper: 'rgba(20, 20, 20, 0.95)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      background: 'linear-gradient(45deg, #8a2be2, #00bcd4)',
      backgroundClip: 'text',
      textFillColor: 'transparent',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(20, 20, 20, 0.95)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
});

// 🎯 Loading component yang lebih baik
const LoadingScreen = ({ message = "Loading Dynamic E4..." }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
    }}
  >
    <CircularProgress
      size={60}
      sx={{
        color: '#8a2be2',
        mb: 3,
      }}
    />
    <Typography
      variant="h6"
      sx={{
        color: 'white',
        fontWeight: 600,
        mb: 1,
      }}
    >
      {message}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: 'rgba(255, 255, 255, 0.7)',
      }}
    >
      Preparing your gaming experience
    </Typography>
  </Box>
);

// 🎯 Firebase initialization dengan error handling
let firebaseApp = null;
let firestore = null;
let auth = null;
let storage = null;

try {
  // Get Firebase config dari Vercell environment variables
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  // Validasi config
  const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
  
  if (missingKeys.length > 0) {
    console.warn('⚠️ Firebase config missing keys:', missingKeys);
    console.log('🔧 Using fallback configuration');
  } else {
    // Initialize Firebase
    firebaseApp = initializeApp(firebaseConfig);
    firestore = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    storage = getStorage(firebaseApp);
    console.log('✅ Firebase initialized successfully');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.log('🔧 Using offline mode');
}

// 🎯 Error recovery system dengan Firebase
class AppErrorHandler extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      isLoading: true,
      error: null,
      firebaseStatus: firebaseApp ? 'connected' : 'disconnected'
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, isLoading: false, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Critical app error:', error, errorInfo);
    this.setState({ 
      hasError: true, 
      isLoading: false,
      error: error
    });

    // Kirim error ke Firebase jika tersedia
    if (firestore) {
      try {
        const { addDoc, collection, serverTimestamp } = require('firebase/firestore');
        addDoc(collection(firestore, 'criticalErrors'), {
          error: error.toString(),
          stack: error.stack,
          timestamp: serverTimestamp(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          errorInfo: errorInfo?.componentStack
        });
        console.log('Critical error reported to Firebase');
      } catch (firebaseError) {
        console.warn('Failed to report to Firebase:', firebaseError);
      }
    }

    // Store critical error di localStorage sebagai fallback
    try {
      localStorage.setItem('criticalError', JSON.stringify({
        error: error.toString(),
        stack: error.stack,
        timestamp: new Date().toISOString(),
        errorInfo: errorInfo?.componentStack,
        firebaseStatus: this.state.firebaseStatus
      }));
    } catch (e) {
      console.warn('Could not store critical error:', e);
    }
  }

  componentDidMount() {
    // Simulate loading time
    const loadingTimer = setTimeout(() => {
      this.setState({ isLoading: false });
    }, 1500);

    this.setState({ loadingTimer });

    // Generate session ID untuk tracking
    const sessionId = localStorage.getItem('sessionId') || `session_${Date.now()}`;
    localStorage.setItem('sessionId', sessionId);
  }

  componentWillUnmount() {
    if (this.state.loadingTimer) {
      clearTimeout(this.state.loadingTimer);
    }
  }

  handleReload = () => {
    // Clear any stored errors
    localStorage.removeItem('criticalError');
    window.location.reload();
  };

  render() {
    if (this.state.isLoading) {
      return <LoadingScreen />;
    }

    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
            color: 'white',
            textAlign: 'center',
            p: 4,
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
            💥 Critical System Error
          </Typography>
          
          <Alert 
            severity={this.state.firebaseStatus === 'connected' ? 'info' : 'warning'}
            sx={{ mb: 3, background: 'rgba(0,0,0,0.3)' }}
          >
            {this.state.firebaseStatus === 'connected' 
              ? '✅ Firebase connected - Error logged to server' 
              : '⚠️ Firebase offline - Error stored locally'}
          </Alert>

          <Typography variant="body1" paragraph sx={{ mb: 3, maxWidth: 600 }}>
            The system encountered a critical error during startup.
            {this.state.error && (
              <Box sx={{ mt: 2, p: 2, background: 'rgba(0,0,0,0.3)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {this.state.error.message || 'Unknown error occurred'}
                </Typography>
              </Box>
            )}
          </Typography>
          
          <Button
            variant="contained"
            onClick={this.handleReload}
            startIcon={<RefreshIcon />}
            size="large"
            sx={{ 
              mt: 2,
              background: 'linear-gradient(45deg, #8a2be2, #00bcd4)',
              '&:hover': {
                background: 'linear-gradient(45deg, #6a1b9a, #0097a7)'
              }
            }}
          >
            Reload System
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// 🎯 Root component dengan proper error handling dan Firebase
const root = ReactDOM.createRoot(document.getElementById('root'));

// Enhanced error handling untuk initial render
try {
  // Cek apakah ada critical error dari session sebelumnya
  const previousCriticalError = localStorage.getItem('criticalError');
  if (previousCriticalError) {
    console.warn('Previous critical error detected:', JSON.parse(previousCriticalError));
    localStorage.removeItem('criticalError');
  }

  // Create app dengan Firebase context
  const app = (
    <React.StrictMode>
      <AppErrorHandler>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <ErrorBoundary>
              <App firebaseApp={firebaseApp} firestore={firestore} auth={auth} storage={storage} />
            </ErrorBoundary>
          </BrowserRouter>
        </ThemeProvider>
      </AppErrorHandler>
    </React.StrictMode>
  );

  root.render(app);
  console.log('✅ Application initialized successfully with Firebase');
  
} catch (error) {
  console.error('❌ Failed to render application:', error);
  
  // Enhanced fallback render
  root.render(
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        color: 'white',
        textAlign: 'center',
        p: 4,
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
        🚨 System Initialization Failed
      </Typography>
      <Typography variant="body1" paragraph sx={{ mb: 3, maxWidth: 600 }}>
        Please check the console for error details and refresh the page.
      </Typography>
      <Button
        variant="contained"
        onClick={() => window.location.reload()}
        startIcon={<RefreshIcon />}
        size="large"
        sx={{ 
          mt: 2,
          background: 'linear-gradient(45deg, #8a2be2, #00bcd4)',
          '&:hover': {
            background: 'linear-gradient(45deg, #6a1b9a, #0097a7)'
          }
        }}
      >
        Force Reload
      </Button>
    </Box>
  );
}

// 🎯 Global error handlers dengan Firebase integration
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // Prevent infinite error loops
  if (window.globalErrorCount > 10) {
    console.error('🚨 Too many global errors, stopping propagation');
    event.preventDefault();
    return;
  }
  
  window.globalErrorCount = (window.globalErrorCount || 0) + 1;
  
  // Kirim ke Firebase jika tersedia
  if (firestore) {
    try {
      const { addDoc, collection, serverTimestamp } = require('firebase/firestore');
      addDoc(collection(firestore, 'globalErrors'), {
        error: event.error?.toString(),
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    } catch (firebaseError) {
      console.warn('Failed to report global error to Firebase:', firebaseError);
    }
  }
  
  // Store di localStorage sebagai fallback
  try {
    const globalErrors = JSON.parse(localStorage.getItem('globalErrors') || '[]');
    globalErrors.push({
      error: event.error?.toString(),
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: new Date().toISOString()
    });
    
    if (globalErrors.length > 5) {
      globalErrors.shift();
    }
    
    localStorage.setItem('globalErrors', JSON.stringify(globalErrors));
  } catch (e) {
    console.warn('Could not store global error:', e);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
  
  // Kirim ke Firebase jika tersedia
  if (firestore) {
    try {
      const { addDoc, collection, serverTimestamp } = require('firebase/firestore');
      addDoc(collection(firestore, 'unhandledRejections'), {
        reason: event.reason?.toString(),
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    } catch (firebaseError) {
      console.warn('Failed to report unhandled rejection to Firebase:', firebaseError);
    }
  }
  
  // Store di localStorage
  try {
    const unhandledRejections = JSON.parse(localStorage.getItem('unhandledRejections') || '[]');
    unhandledRejections.push({
      reason: event.reason?.toString(),
      timestamp: new Date().toISOString()
    });
    
    if (unhandledRejections.length > 5) {
      unhandledRejections.shift();
    }
    
    localStorage.setItem('unhandledRejections', JSON.stringify(unhandledRejections));
  } catch (e) {
    console.warn('Could not store unhandled rejection:', e);
  }
});

// Initialize global error count
window.globalErrorCount = 0;

// Cleanup function untuk development
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    console.log('🔄 Hot module replacement, cleaning up...');
    localStorage.removeItem('criticalError');
  });
}

// Export Firebase instances untuk digunakan di komponen lain
export { firebaseApp, firestore, auth, storage };

console.log('🎯 Main.jsx loaded successfully with Firebase integration');
g
