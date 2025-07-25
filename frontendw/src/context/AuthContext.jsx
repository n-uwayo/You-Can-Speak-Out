import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios
        .get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          setUser(res.data.data.user);
        })
        .catch(() => {
          setUser(null);
          setToken('');
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    axios.post('http://localhost:5000/api/auth/logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
