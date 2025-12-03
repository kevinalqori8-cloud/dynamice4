// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { CircularProgress, Box } from '@mui/material';

// 🎯 Tema yang konsisten untuk semua game
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8a2be2', // Warna ungu consistent
      light: '#a052f5',
      dark: '#6a1b9a',
    },
    secondary: {
      main: '#00bcd4', // Cyan accent
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
const LoadingScreen = () => (
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
      Loading Dynamic E4...
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

// 🎯 Error recovery system
class AppErrorHandler extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, isLoading: true };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, isLoading: false };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Critical app error:', error, errorInfo);
    this.setState({ hasError: true, isLoading: false });
  }

  componentDidMount() {
    // Simulate loading time
    setTimeout(() => {
      this.setState({ isLoading: false });
    }, 1500);
  }

  handleReload = () => {
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
          <Typography variant="h4" gutterBottom>
            💥 Critical System Error
          </Typography>
          <Typography variant="body1" paragraph>
            The system encountered a critical error during startup.
          </Typography>
          <Button
            variant="contained"
            onClick={this.handleReload}
            startIcon={<RefreshIcon />}
            sx={{ mt: 2 }}
          >
            Reload System
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// 🎯 Root component dengan proper error handling
const root = ReactDOM.createRoot(document.getElementById('root'));

// Coba render dengan error handling ekstra
try {
  root.render(
    <React.StrictMode>
      <AppErrorHandler>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </BrowserRouter>
        </ThemeProvider>
      </AppErrorHandler>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render application:', error);
  
  // Fallback render
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
      <Typography variant="h4" gutterBottom>
        🚨 System Initialization Failed
      </Typography>
      <Typography variant="body1" paragraph>
        Please check the console for error details and refresh the page.
      </Typography>
      <Button
        variant="contained"
        onClick={() => window.location.reload()}
        startIcon={<RefreshIcon />}
        sx={{ mt: 2 }}
      >
        Force Reload
      </Button>
    </Box>
  );
}

// 🎯 Global error handlers
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Prevent infinite error loops
  if (window.errorCount > 5) {
    console.error('Too many errors, stopping error propagation');
    event.preventDefault();
  }
  window.errorCount = (window.errorCount || 0) + 1;
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// Initialize error count
window.errorCount = 0;

