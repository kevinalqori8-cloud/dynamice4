import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error details
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

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            p: 3
          }}
        >
          <Paper elevation={3} sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
            <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
            
            <Typography variant="h4" color="error" gutterBottom>
              Oops! Something went wrong
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We're sorry, but something unexpected happened. 
              The error has been logged and we'll look into it.
            </Typography>

            {this.state.error && (
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={this.toggleDetails}
                  sx={{ mb: 2 }}
                >
                  {this.state.showDetails ? 'Hide Details' : 'Show Error Details'}
                </Button>
                
                {this.state.showDetails && (
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      backgroundColor: '#fafafa',
                      textAlign: 'left',
                      fontSize: '0.8rem'
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Error Details:
                    </Typography>
                    <Typography component="div" sx={{ mb: 1 }}>
                      <strong>Error:</strong> {this.state.error.toString()}
                    </Typography>
                    {this.state.errorInfo && (
                      <Typography component="div">
                        <strong>Component Stack:</strong>
                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.7rem' }}>
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </Typography>
                    )}
                  </Paper>
                )}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.resetError}
              >
                Try Again
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

