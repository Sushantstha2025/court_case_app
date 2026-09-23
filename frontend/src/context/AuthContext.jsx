import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('court_tracker_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('court_tracker_token');
      if (storedToken) {
        try {
          const profile = await api.getProfile();
          setUser(profile);
          setToken(storedToken);
        } catch (err) {
          console.error('Failed to authenticate stored token:', err.message);
          localStorage.removeItem('court_tracker_token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('court_tracker_token', data.token);
    setToken(data.token);
    setUser({
      _id: data._id,
      fullName: data.fullName,
      email: data.email,
    });
    return data;
  };

  const register = async (fullName, email, password) => {
    const data = await api.register(fullName, email, password);
    localStorage.setItem('court_tracker_token', data.token);
    setToken(data.token);
    setUser({
      _id: data._id,
      fullName: data.fullName,
      email: data.email,
    });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('court_tracker_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (fullName) => {
    const updated = await api.updateProfile(fullName);
    setUser((prev) => ({ ...prev, fullName: updated.fullName }));
    return updated;
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await api.changePassword(currentPassword, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
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
