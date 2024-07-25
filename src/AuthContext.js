// src/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:1337/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => setUser(response.data))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        });
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:1337/api/auth/local', {
        identifier: email,
        password: password,
      });
      localStorage.setItem('token', response.data.jwt);
      setUser(response.data.user);
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Erro ao fazer login: Verifique suas credenciais e tente novamente.';
      toast.error(errorMessage);
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('http://localhost:1337/api/auth/local/register', {
        username,
        email,
        password,
      });
      localStorage.setItem('token', response.data.jwt);
      setUser(response.data.user);
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Erro ao registrar: Verifique suas informações e tente novamente.';
      toast.error(errorMessage);
    }
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post('http://localhost:1337/api/auth/forgot-password', { email });
      toast.success('Um e-mail de recuperação foi enviado!');
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Erro ao solicitar recuperação de senha. Tente novamente.';
      toast.error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, forgotPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
