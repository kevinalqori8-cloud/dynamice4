import React, { createContext, useContext, useState, useEffect } from 'react';

// Fallback AuthContext untuk saat yang asli tidak tersedia
const AuthContextFallback = createContext();

export const AuthProviderFallback = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage untuk user data
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.warn('Failed to parse stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('lastLoginTime');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContextFallback.Provider value={value}>
      {children}
    </AuthContextFallback.Provider>
  );
};

export const useAuthFallback = () => {
  const context = useContext(AuthContextFallback);
  if (!context) {
    return { user: null, login: () => {}, logout: () => {}, loading: false };
  }
  return context;
};

