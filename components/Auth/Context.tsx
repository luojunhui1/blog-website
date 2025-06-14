'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, AuthState } from '@/types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    isAuthenticated: false,
    isGuest: false,
  });

  // 初始化时从 localStorage 加载 token
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const isGuest = localStorage.getItem('is_guest') === 'true';
    if (token) {
      setAuthState({
        token,
        isAuthenticated: true,
        isGuest: false,
      });
    } else if (isGuest) {
      setAuthState({
        token: 'custom',
        isAuthenticated: false,
        isGuest: true,
      });
    }
  }, []);

  const login = async (password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
        credentials: 'include', // 确保包含 cookies
      });

      if (!response.ok) {
        throw new Error('Invalid password');
      }

      const { token } = await response.json();
      
      // 保存 token 到 localStorage
      localStorage.setItem('auth_token', token);
      localStorage.removeItem('is_guest');
      
      setAuthState({
        token,
        isAuthenticated: true,
        isGuest: false,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const loginAsGuest = () => {
    localStorage.setItem('is_guest', 'true');
    localStorage.removeItem('auth_token');
    setAuthState({
      token: 'custom',
      isAuthenticated: false,
      isGuest: true,
    });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('is_guest');
    // 清除 cookie
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setAuthState({
      token: null,
      isAuthenticated: false,
      isGuest: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}