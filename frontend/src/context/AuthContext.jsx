import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Synchronously initialize default Authorization header if token exists in localStorage
const initialToken = localStorage.getItem('erp_token') || localStorage.getItem('token');
if (initialToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('erp_user') || localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('erp_token') || localStorage.getItem('token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Setup Axios default Authorization header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('erp_token', token);
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('erp_token');
      localStorage.removeItem('token');
    }
  }, [token]);

  // Sync User to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('erp_user', JSON.stringify(user));
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('erp_user');
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, [user]);

  // Login Function
  const login = async (identifier, password) => {
    try {
      const response = await axios.post('/api/auth/login', { identifier, password });
      if (response.data && response.data.success) {
        const { user: userData, token: jwtToken } = response.data.data;
        setUser(userData);
        setToken(jwtToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
        localStorage.setItem('erp_token', jwtToken);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('erp_user', JSON.stringify(userData));
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Authentication error';
      return { success: false, message: msg };
    }
  };

  // Logout Function - Clears all session data and redirects directly to /login
  const logout = () => {
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('erp_token');
    localStorage.removeItem('token');
    localStorage.removeItem('erp_user');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Update user state
  const updateUser = (newUserData) => {
    setUser((prev) => ({ ...prev, ...newUserData }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
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
