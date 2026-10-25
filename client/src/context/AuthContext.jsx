import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('proofpocket_token'));
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState({
    isConnected: false,
    state: 'unknown',
    isConfigured: false,
    databaseName: null,
    host: null,
    error: null,
  });

  const checkDb = async () => {
    try {
      const res = await api.health.check();
      setDbStatus(res.database || {});
    } catch {
      setDbStatus({
        isConnected: false,
        state: 'server_unreachable',
        error: 'Backend server is not responding'
      });
    }
  };

  useEffect(() => {
    checkDb();
    const interval = setInterval(checkDb, 15000); // Check DB status periodically
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('proofpocket_token');
      if (storedToken) {
        try {
          const res = await api.auth.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch {
          // If token invalid, clear
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('proofpocket_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.error || 'Login failed');
  };

  const register = async (name, email, password) => {
    const res = await api.auth.register({ name, email, password });
    if (res.success && res.token) {
      localStorage.setItem('proofpocket_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.error || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('proofpocket_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        dbStatus,
        checkDb,
        login,
        register,
        logout,
        isAuthenticated: Boolean(user && token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
