import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('/api/auth/me');
          if (res.data.success && res.data.data.user) {
            setUser(res.data.data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Session restoration failed:', err.message);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success && res.data.data) {
        const { token, user: userData } = res.data.data;
        localStorage.setItem('token', token);
        setUser(userData);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Invalid credentials';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { username, email, password });
      if (res.data.success && res.data.data) {
        const { token, user: userData } = res.data.data;
        localStorage.setItem('token', token);
        setUser(userData);
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
