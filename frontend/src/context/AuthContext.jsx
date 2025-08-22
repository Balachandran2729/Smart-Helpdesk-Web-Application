// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// Create the context
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // For initial load check

  // Check if user is already logged in (on app load)
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        try {
          // Basic validation - in a real app, you might verify the token with the backend
          const userData = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Error parsing stored user data:', err);
          // If parsing fails, clear potentially corrupt data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false); // Done checking
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user)); // Store user data
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Clear state on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, message: err.response?.data?.message || err.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, message: err.response?.data?.message || err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    authService.logout(); // Clear local storage via service
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading, // Expose loading state
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;