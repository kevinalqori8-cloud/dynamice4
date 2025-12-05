// src/components/Game/SafeGameWrapper.jsx
import React, { ErrorBoundary } from 'react';

// SAFETY: Safe character extraction untuk semua game
export const safeCharAt = (str, index) => {
  if (typeof str !== 'string' || !str || str.length <= index) return '';
  return str.charAt(index);
};

// SAFETY: Safe property access
export const safeGet = (obj, path, defaultValue = '') => {
  try {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
  } catch {
    return defaultValue;
  }
};

// SAFETY: Safe function call
export const safeCall = (fn, ...args) => {
  try {
    return typeof fn === 'function' ? fn(...args) : undefined;
  } catch (error) {
    console.warn('Function call failed:', error);
    return undefined;
  }
};

class GameErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Game Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center p-8">
            <h2 className="text-2xl mb-4">🎮 Game Error</h2>
            <p className="mb-4">{this.state.error?.message || 'Unknown error occurred'}</p>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-blue-600 rounded"
            >
              Retry Game
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GameErrorBoundary;

