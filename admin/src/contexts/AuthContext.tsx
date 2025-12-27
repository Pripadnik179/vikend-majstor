import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Admin {
  id: number;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'moderator';
}

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || '';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdmin(data.admin);
      } else {
        localStorage.removeItem('admin_token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, twoFactorCode?: string) => {
    const response = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, twoFactorCode }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Prijava nije uspela');
    }

    const data = await response.json();
    localStorage.setItem('admin_token', data.token);
    setAdmin(data.admin);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
