// src/hooks/useSafeGame.js
import { useState, useEffect, useCallback } from 'react';

// FIX untuk "n is not a function" dan "charAt" errors
export const safeCharAt = (str, index) => {
  if (typeof str !== 'string' || !str || str.length <= index) return '';
  return str.charAt(index) || '';
};

// FIX untuk undefined property access
export const safeGet = (obj, path, defaultValue = '') => {
  try {
    if (!obj || typeof obj !== 'object') return defaultValue;
    return path.split('.').reduce((acc, part) => 
      acc && acc[part] !== undefined ? acc[part] : defaultValue, obj);
  } catch {
    return defaultValue;
  }
};

// FIX untuk function calls
export const safeCall = (fn, ...args) => {
  try {
    return typeof fn === 'function' ? fn(...args) : undefined;
  } catch (error) {
    console.warn('Function call failed:', error);
    return undefined;
  }
};

// FIX untuk localStorage errors
export const safeLocalStorage = {
  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('localStorage error:', error);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage error:', error);
    }
  }
};

// FIX untuk navigation errors
export const safeNavigate = (navigate, path) => {
  try {
    if (navigate && typeof navigate === 'function') {
      navigate(path);
    } else {
      window.location.href = path;
    }
  } catch (error) {
    console.error('Navigation error:', error);
    window.location.href = path;
  }
};

export const useSafeGame = () => {
  const [gameError, setGameError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const safeGameInit = useCallback(async (initFunction) => {
    setIsLoading(true);
    try {
      await initFunction();
    } catch (error) {
      console.error('Game initialization failed:', error);
      setGameError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    gameError,
    isLoading,
    safeGameInit,
    safeCharAt,
    safeGet,
    safeCall,
    safeLocalStorage,
    safeNavigate
  };
};

