import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  TextField, 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  BugReport as BugReportIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Email as EmailIcon
} from '@mui/icons-material';

// Firebase imports untuk error reporting
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showPasswordMenu: false,
      passwordInput: '',
      developerPassword: 'DEV2024',
      isAuthenticated: false,
      isReporting: false,
      userDescription: '',
      autoRefreshTimer: null,
      errorCount: 0,
      firestore: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  async componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorCount: this.state.errorCount + 1
    });

    // Initialize Firebase Firestore
    try {
      const firestore = getFirestore();
      this.setState({ firestore });
    } catch (firebaseError) {
      console.warn('Firebase not available, using localStorage fallback:', firebaseError);
    }

    // Store error in localStorage for debugging
    try {
      const errorHistory = JSON.parse(localStorage.getItem('errorHistory') || '[]');
      errorHistory.push({
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
      
      if (errorHistory.length > 10) {
        errorHistory.shift();
      }
      
      localStorage.setItem('errorHistory', JSON.stringify(errorHistory));
    } catch (e) {
      console.warn('Could not store error in localStorage:', e);
    }

    this.scheduleAutoRefresh();
  }

  componentWillUnmount() {
    if (this.state.autoRefreshTimer) {
      clearTimeout(this.state.autoRefreshTimer);
    }
  }

  scheduleAutoRefresh = () => {
    const timer = setTimeout(() => {
      if (this.state.hasError) {
        console.log('Auto-refreshing due to persistent error...');
        window.location.reload();
      }
    }, 120000);
    
    this.setState({ autoRefreshTimer: timer });
  };

  handleReset = () => {
    if (this.state.autoRefreshTimer) {
      clearTimeout(this.state.autoRefreshTimer);
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showPasswordMenu: false,
      passwordInput: '',
      isAuthenticated: false,
      userDescription: '',
      autoRefreshTimer: null
    });
    
    window.location.reload();
  };

  handlePasswordSubmit = () => {
    if (this.state.passwordInput === this.state.developerPassword) {
      this.setState({ isAuthenticated: true, showPasswordMenu: false });
    } else {
      alert('Password salah!');
      this.setState({ passwordInput: '' });
    }
  };

  handleErrorReport = async () => {
    this.setState({ isReporting: true });
    
    try {
      const reportData = {
        error: this.state.error?.toString(),
        stack: this.state.error?.stack,
        errorInfo: this.state.errorInfo?.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: serverTimestamp(),
        userDescription: this.state.userDescription,
        errorCount: this.state.errorCount,
        userId: localStorage.getItem('userId') || 'anonymous',
        sessionId: localStorage.getItem('sessionId') || 'unknown'
      };

      // Coba kirim ke Firebase dulu
      if (this.state.firestore) {
        try {
          await addDoc(collection(this.state.firestore, 'errorReports'), reportData);
          console.log('Error report sent to Firebase');
        } catch (firebaseError) {
          console.warn('Firebase error reporting failed:', firebaseError);
          // Fallback ke localStorage
          this.saveToLocalStorage(reportData);
        }
      } else {
        // Firebase tidak tersedia, pakai localStorage
        this.saveToLocalStorage(reportData);
      }
      
      alert('Error report telah dikirim dan disimpan. Terima kasih atas bantuan Anda!');
      this.setState({ isReporting: false, userDescription: '' });
    } catch (error) {
      console.error('Failed to send error report:', error);
      alert('Gagal mengirim error report. Data disimpan secara lokal.');
      this.setState({ isReporting: false });
    }
  };

  saveToLocalStorage = (reportData) => {
    const reports = JSON.parse(localStorage.getItem('errorReports') || '[]');
    reports.push({
      ...reportData,
      timestamp: new Date().toISOString() // Override serverTimestamp untuk local
    });
    
    if (reports.length > 50) {
      reports.shift(); // Batasi jumlah reports
    }
    
    localStorage.setItem('errorReports', JSON.stringify(reports));
    console.log('Error report saved to localStorage');
  };

  getErrorMessage = () => {
    const { error } = this.state;
    if (!error) return "Terjadi masalah yang tidak terduga";
    
    const errorMessages = {
      'TypeError': 'Terjadi kesalahan tipe data. Halaman akan diperbarui.',
      'ReferenceError': 'Referensi tidak ditemukan. Halaman akan diperbarui.',
      'SyntaxError': 'Kesalahan sintaks. Halaman akan diperbarui.',
      'RangeError': 'Nilai di luar jangkauan. Halaman akan diperbarui.',
      'NetworkError': 'Kesalahan jaringan. Periksa koneksi internet Anda.',
      'FirebaseError': 'Kesalahan database. Silakan coba lagi.',
      'ChunkLoadError': 'Gagal memuat bagian aplikasi. Halaman akan diperbarui.',
      'ModuleNotFoundError': 'Modul tidak ditemukan. Halaman akan diperbarui.'
    };

    const errorType = error.name || 'UnknownError';
    return errorMessages[errorType] || error.message || "Terjadi masalah yang tidak terduga";
  };

  getErrorSeverity = () => {
    const { error } = this.state;
    if (!error) return 'low';
    
    if (error.message?.includes('Firebase') || error.name === 'NetworkError') {
      return 'high';
    } else if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'medium';
    }
    return 'low';
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const severity = this.getErrorSeverity();
    const errorMessage = this.getErrorMessage();

    return (
      <Box 
        sx={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          zIndex: 9999
        }}
      >
        <Paper 
          sx={{
            p: 4,
            background: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            maxWidth: 600,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(138, 43, 226, 0.3)'
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(45deg, #8a2be2, #00bcd4)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              mb: 2
            }}>
              💥 System Error
            </Typography>
            
            <Chip 
              label={`Severity: ${severity.toUpperCase()}`}
              color={severity === 'high' ? 'error' : severity === 'medium' ? 'warning' : 'info'}
              size="small"
              sx={{ mb: 2 }}
            />
            
            <Typography variant="body1" color="white" mb={2}>
              {errorMessage}
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2, background: 'rgba(0, 0, 0, 0.3)' }}>
              Halaman akan otomatis diperbarui dalam 2 menit untuk memperbaiki masalah ini.
            </Alert>
          </Box>

          {/* Firebase Status */}
          <Box mb={3}>
            <Alert 
              severity={this.state.firestore ? 'success' : 'warning'} 
              sx={{ mb: 2, background: 'rgba(0, 0, 0, 0.3)' }}
            >
              {this.state.firestore 
                ? '✅ Firebase connected - Error reports will be sent to server' 
                : '⚠️ Firebase offline - Error reports will be stored locally'}
            </Alert>
          </Box>

          {/* Developer Access */}
          <Box mb={3}>
            {!this.state.showPasswordMenu && !this.state.isAuthenticated && (
              <Button
                startIcon={<BugReportIcon />}
                onClick={() => this.setState({ showPasswordMenu: true })}
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mb: 2 }}
              >
                Developer Access
              </Button>
            )}

            {this.state.showPasswordMenu && !this.state.isAuthenticated && (
              <Box mb={2} p={2} sx={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: 2 }}>
                <Typography variant="h6" mb={2} color="white">
                  <SecurityIcon sx={{ mr: 1 }} />
                  Developer Access
                </Typography>
                
                <TextField
                  fullWidth
                  type="password"
                  label="Developer Password"
                  value={this.state.passwordInput}
                  onChange={(e) => this.setState({ passwordInput: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && this.handlePasswordSubmit()}
                  size="small"
                  sx={{ mb: 2 }}
                />
                
                <Box display="flex" gap={1}>
                  <Button
                    onClick={this.handlePasswordSubmit}
                    variant="contained"
                    size="small"
                  >
                    Access
                  </Button>
                  <Button
                    onClick={() => this.setState({ showPasswordMenu: false, passwordInput: '' })}
                    variant="outlined"
                    size="small"
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}

            {/* Detailed Error Information */}
            {this.state.isAuthenticated && this.state.error && (
              <Accordion sx={{ mb: 2, background: 'rgba(0, 0, 0, 0.3)' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Detailed Error Information</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box>
                      <Typography variant="subtitle2" color="white">Error Name:</Typography>
                      <Typography variant="body2" sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.8rem',
                        background: 'rgba(0, 0, 0, 0.5)',
                        p: 1,
                        borderRadius: 1
                      }}>
                        {this.state.error.name}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="white">Error Message:</Typography>
                      <Typography variant="body2" sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.8rem',
                        background: 'rgba(0, 0, 0, 0.5)',
                        p: 1,
                        borderRadius: 1
                      }}>
                        {this.state.error.message}
                      </Typography>
                    </Box>
                    
                    {this.state.error.stack && (
                      <Box>
                        <Typography variant="subtitle2" color="white">Stack Trace:</Typography>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.7rem',
                          background: 'rgba(0, 0, 0, 0.5)',
                          p: 1,
                          borderRadius: 1,
                          maxHeight: 200,
                          overflow: 'auto'
                        }}>
                          {this.state.error.stack}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>

          {/* User Report Section */}
          <Box mb={3}>
            <Typography variant="h6" mb={2} color="white">
              <EmailIcon sx={{ mr: 1 }} />
              Laporkan Masalah
            </Typography>
            
            <Typography variant="body2" mb={2} color="rgba(255, 255, 255, 0.7)">
              Bantu kami memperbaiki masalah ini dengan menjelaskan apa yang terjadi:
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Deskripsi Masalah"
              value={this.state.userDescription}
              onChange={(e) => this.setState({ userDescription: e.target.value })}
              placeholder="Jelaskan apa yang Anda lakukan saat error terjadi..."
              sx={{ mb: 2 }}
            />
            
            <Button
              startIcon={this.state.isReporting ? <CircularProgress size={20} /> : <BugReportIcon />}
              onClick={this.handleErrorReport}
              disabled={this.state.isReporting}
              variant="contained"
              color="secondary"
              fullWidth
            >
              {this.state.isReporting ? 'Mengirim...' : 'Kirim Error Report'}
            </Button>
          </Box>

          {/* Actions */}
          <Box display="flex" flexDirection="column" gap={2}>
            <Button
              startIcon={<RefreshIcon />}
              onClick={this.handleReset}
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              Muat Ulang Halaman
            </Button>
            
            <Button
              onClick={() => window.history.back()}
              variant="outlined"
              fullWidth
            >
              Kembali ke Halaman Sebelumnya
            </Button>
          </Box>

          {/* Technical Info Footer */}
          <Box mt={3} pt={2} borderTop="1px solid rgba(255, 255, 255, 0.1)">
            <Typography variant="caption" color="rgba(255, 255, 255, 0.5)" textAlign="center" display="block">
              Error ID: {this.state.error?.name || 'UNKNOWN'}_{Date.now()}
            </Typography>
            <Typography variant="caption" color="rgba(255, 255, 255, 0.5)" textAlign="center" display="block">
              Error Count: {this.state.errorCount} | Firebase: {this.state.firestore ? '✅ Online' : '❌ Offline'}
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }
}

export default ErrorBoundary;

