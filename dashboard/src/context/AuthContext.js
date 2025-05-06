import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to set the auth token in axios defaults
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('auth_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('auth_token');
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        setAuthToken(token);
        
        const response = await axios.get('/api/auth/me');
        setUser(response.data);
      } catch (err) {
        // Token expired or invalid
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Register a new user
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password
      });
      
      const { token, user } = response.data;
      
      setAuthToken(token);
      setUser(user);
      return user;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Login a user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      setAuthToken(token);
      setUser(user);
      return user;
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid credentials';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout a user
  const logout = async () => {
    setLoading(true);
    
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAuthToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      setUser(response.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.put('/api/auth/password', {
        currentPassword,
        newPassword
      });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update password';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Clear any errors
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    updatePassword,
    clearError,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 