// src/hooks/use-auth.ts

"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth/auth-store';
import { AuthService } from '@/lib/auth/auth-service';

export function useAuth() {
  const { user, isAuthenticated, setUser, signOut } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const authService = new AuthService();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          signOut();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        signOut();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.signIn(email, password);
      const user = await authService.getCurrentUser();
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, metadata?: Record<string, any>) => {
    setIsLoading(true);
    try {
      await authService.signUp(email, password, metadata);
      const user = await authService.getCurrentUser();
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      signOut();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout
  };
}
