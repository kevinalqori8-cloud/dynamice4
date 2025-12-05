// src/main.jsx - VERSI FIXED
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ✅ BrowserRouter HANYA di sini!
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import App from './App.jsx';
import EnhancedErrorBoundary from './components/EnhancedErrorBoundary.jsx';
import './index.css';

// 🎨 Enhanced Theme
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
    fontFamily: '"Inter", "Poppins", "Roboto", sans-serif',
    h1: {
      fontWeight: 800,
      background: 'linear-gradient(45deg, #8a2be2, #00bcd4)',
      backgroundClip: 'text',
      textFillColor: 'transparent',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          },
        },
      },
    },
  },
});

// 🎯 Clean Root Render
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <EnhancedErrorBoundary>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </EnhancedErrorBoundary>
  </React.StrictMode>
);

