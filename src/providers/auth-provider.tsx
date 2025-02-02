// src/providers/auth-provider.tsx -->

"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { initializeAuth } from '@/lib/auth/init';
import { ErrorLogger } from '../lib/errors/logger';
import { DebugLogger } from 'util';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);

        // Initialize auth system and demo account
        await initializeAuth();

        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        setUser(session?.user ?? null);

        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>\n\n\nBefore the auth is initailizing\n\n\n<<<<<<<<<<<<<<<<<<<<<<<<<<");

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            // setUser(session?.user ?? null);
            
            if (event === 'SIGNED_OUT') {
              router.push('/auth/login');
            } else if (event === 'SIGNED_IN') {
              router.push('/dashboard');
            }
          }
        );

        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>\n\n\nAuth initialized successfully\n\n\n<<<<<<<<<<<<<<<<<<<<<<<<<<");
      

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        toast.error('Failed to initialize auth');
        ErrorLogger.error('Auth initialization failed', error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Successfully signed in');
    } catch (error) {
      toast.error('Invalid email or password');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      });
      if (error) throw error;
      toast.success('Registration successful');
    } catch (error) {
      toast.error('Registration failed');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Successfully signed out');
    } catch (error) {
      toast.error('Failed to sign out');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      signIn,
      signUp,
      signOut
    }}>
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
