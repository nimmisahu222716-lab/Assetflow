import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('assetflow_token');
      if (token) {
        try {
          const userData = await fetchAPI('/auth/me');
          setUser(userData);
        } catch (err) {
          console.error('Session expired or invalid token');
          localStorage.removeItem('assetflow_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('assetflow_token', data.token);
    setUser(data);
    return data;
  };

  const signup = async (name, email, password, department) => {
    const data = await fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, department })
    });
    localStorage.setItem('assetflow_token', data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('assetflow_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
