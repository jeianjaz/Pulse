'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Match your current user types from the backend
type UserRole = 'patient' | 'doctor' | 'admin';
type UserType = 1 | 2 | 3; // 1: Patient, 2: Doctor, 3: Admin

type RoleData = {
  // Patient fields
  medical_history?: string;
  emergency_contact?: string;
  // Doctor fields
  specialization?: string;
  license_number?: string;
  // Admin fields
  department?: string;
  admin_level?: number;
};

type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: UserType;
  role: UserRole;
  role_data?: RoleData;
  account_status?: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus()
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, []);

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const response = await axios.get('/api/auth/user');
      setUser(response.data.data);
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      return false;
    }
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/auth/login/', { username, password });
      setUser(response.data.data.user);
      localStorage.setItem('first_name', response.data.data.user.first_name);
      localStorage.setItem('last_name', response.data.data.user.last_name);
      if (response.data.data.user.user_type === 1) {
        router.push('/patient'); 
      } else if (response.data.data.user.user_type === 2) {
        router.push('/doctor');
      } else {
        router.push('/admin');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, {
        withCredentials: true
      });
      setUser(null);
      router.push('/login');
    } catch (error: any) {
      console.error('Logout failed:', error);
      setError(error.response?.data?.error || error.message || 'Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout, checkAuthStatus }}>
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