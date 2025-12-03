import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
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
import { motion, AnimatePresence } from 'framer-motion';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      showPasswordMenu: false,
      passwordInput: '',
      developerPassword: 'developer2024', // Ganti dengan password yang lebih aman
      isAuthenticated: false,
      isReporting: false,
      userDescription: ''
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Send error to analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'exception', {
        description: `${error.name}: ${error.message}`,
        fatal: true
      });
    }

    // Auto refresh setelah beberapa menit jika error persisten
    this.scheduleAutoRefresh();
  }

  scheduleAutoRefresh = () => {
    // Auto refresh setelah 2 menit jika error persisten
    setTimeout(() => {
      if (this.state.hasError) {
        console.log('Auto-refreshing due to persistent error...');
        window.location.reload();
      }
    }, 120000); // 2 menit
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      showPasswordMenu: false,
      passwordInput: '',
      isAuthenticated: false,
      userDescription: ''
    });
    
    // Clear any cached error states
    localStorage.removeItem('lastError');
    localStorage.removeItem('errorCount');
    
    // Force reload to clean state
    window.location.reload();
  };

  handlePasswordSubmit = () => {
    if (this.state.passwordInput === this.state.developerPassword) {
      this.setState({ isAuthenticated: true, showPasswordMenu: false });
    } else {
      alert('Password salah!');
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
        timestamp: new Date().toISOString(),
        userDescription: this.state.userDescription,
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage }
      };

      // Kirim ke Firebase atau email
      await this.sendErrorReport(reportData);
      
      alert('Error report telah dikirim. Terima kasih atas bantuan Anda!');
      this.setState({ isReporting: false, userDescription: '' });
    } catch (error) {
      console.error('Failed to send error report:', error);
      alert('Gagal mengirim error report. Silakan coba lagi.');
      this.setState({ isReporting: false });
    }
  };

  sendErrorReport = async (reportData) => {
    // Implementasi pengiriman error report
    // Bisa ke Firebase, email, atau error tracking service
    console.log('Error Report:', reportData);
    
    // Contoh pengiriman ke Firebase (sesuaikan dengan config Anda)
    try {
      const response = await fetch('/api/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      return await response.json();
    } catch (error) {
      // Fallback: kirim ke email atau simpan di localStorage
      const errorReports = JSON.parse(localStorage.getItem('errorReports') || '[]');
      errorReports.push(reportData);
      localStorage.setItem('errorReports', JSON.stringify(errorReports));
      
      throw error;
    }
  };

  getErrorMessage = () => {
    const { error } = this.state;
    if (!error) return "Terjadi masalah yang tidak terduga";
    
    // User-friendly error messages
    const errorMessages = {
      'TypeError': 'Terjadi kesalahan tipe data. Halaman akan diperbarui.',
      'ReferenceError': 'Referensi tidak ditemukan. Halaman akan diperbarui.',
      'SyntaxError': 'Kesalahan sintaks. Halaman akan diperbarui.',
      'RangeError': 'Nilai di luar jangkauan. Halaman akan diperbarui.',
      'NetworkError': 'Kesalahan jaringan. Periksa koneksi internet Anda.',
      'FirebaseError': 'Kesalahan database. Silakan coba lagi.',
    };

    const errorType = error.name || 'UnknownError';
    return errorMessages[errorType] || error.message || "Terjadi masalah yang tidak terduga";
  };

  getErrorSeverity = () => {
    const { error } = this.state;
    if (!error) return 'low';
    
    // Determine severity based on error type
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
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="max-w-2xl w-full"
          >
            <Paper className="p-8 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  💥
                </motion.div>
                <Typography variant="h4" className="font-bold text-red-700 mb-2">
                  Ups! Terjadi Kesalahan
                </Typography>
                
                {/* Severity Indicator */}
                <Chip 
                  label={`Severity: ${severity.toUpperCase()}`}
                  color={severity === 'high' ? 'error' : severity === 'medium' ? 'warning' : 'info'}
                  size="small"
                  className="mb-4"
                />
                
                <Typography variant="body1" className="text-gray-700 mb-4">
                  {errorMessage}
                </Typography>
                
                <Alert severity="info" className="mb-4">
                  Halaman akan otomatis diperbarui dalam 2 menit untuk memperbaiki masalah ini.
                </Alert>
              </div>

              {/* Error Details (Developer Access) */}
              <div className="mb-6">
                {!this.state.showPasswordMenu && !this.state.isAuthenticated && (
                  <Button
                    startIcon={<BugReportIcon />}
                    onClick={() => this.setState({ showPasswordMenu: true })}
                    variant="outlined"
                    size="small"
                    className="mb-4"
                  >
                    Developer Access
                  </Button>
                )}

                <AnimatePresence>
                  {this.state.showPasswordMenu && !this.state.isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <Typography variant="h6" className="mb-3 flex items-center">
                        <SecurityIcon className="mr-2" />
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
                        className="mb-3"
                      />
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={this.handlePasswordSubmit}
                          variant="contained"
                          size="small"
                        >
                          Access
                        </Button>
                        <Button
                          onClick={() => this.setState({ showPasswordMenu: false })}
                          variant="outlined"
                          size="small"
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Detailed Error Information */}
                {this.state.isAuthenticated && this.state.error && (
                  <Accordion className="mb-4">
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Detailed Error Information</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div className="space-y-4">
                        <div>
                          <Typography variant="subtitle2" className="font-bold">Error Name:</Typography>
                          <Typography variant="body2" className="font-mono text-sm bg-gray-100 p-2 rounded">
                            {this.state.error.name}
                          </Typography>
                        </div>
                        
                        <div>
                          <Typography variant="subtitle2" className="font-bold">Error Message:</Typography>
                          <Typography variant="body2" className="font-mono text-sm bg-gray-100 p-2 rounded">
                            {this.state.error.message}
                          </Typography>
                        </div>
                        
                        {this.state.error.stack && (
                          <div>
                            <Typography variant="subtitle2" className="font-bold">Stack Trace:</Typography>
                            <Typography 
                              variant="body2" 
                              className="font-mono text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32"
                            >
                              {this.state.error.stack}
                            </Typography>
                          </div>
                        )}
                        
                        {this.state.errorInfo?.componentStack && (
                          <div>
                            <Typography variant="subtitle2" className="font-bold">Component Stack:</Typography>
                            <Typography 
                              variant="body2" 
                              className="font-mono text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32"
                            >
                              {this.state.errorInfo.componentStack}
                            </Typography>
                          </div>
                        )}
                      </div>
                    </AccordionDetails>
                  </Accordion>
                )}
              </div>

              {/* User Report Section */}
              <div className="mb-6">
                <Typography variant="h6" className="mb-3 flex items-center">
                  <EmailIcon className="mr-2" />
                  Laporkan Masalah
                </Typography>
                
                <Typography variant="body2" className="mb-3 text-gray-600">
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
                  className="mb-3"
                />
                
                <Button
                  startIcon={this.state.isReporting ? <CircularProgress size={20} /> : <BugReportIcon />}
                  onClick={this.handleErrorReport}
                  disabled={this.state.isReporting}
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  {this.state.isReporting ? 'Mengirim...' : 'Kirim Error Report'}
                </Button>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={this.handleReset}
                  variant="contained"
                  color="success"
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
              </div>

              {/* Technical Info Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Typography variant="caption" className="text-gray-500 text-center block">
                  Error ID: {this.state.error?.name || 'UNKNOWN'}_{Date.now()}
                </Typography>
                <Typography variant="caption" className="text-gray-500 text-center block">
                  Browser: {navigator.userAgent.split(' ')[0]} | Time: {new Date().toLocaleString()}
                </Typography>
              </div>
            </Paper>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }
}

export default ErrorBoundary;

