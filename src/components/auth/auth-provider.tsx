// src/components/auth/auth-provider.tsx -->

"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/auth/auth-store';
import { ErrorLogger } from '@/lib/errors/logger';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setLoading } = useAuthStore();
  

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session?.user) {
              setUser(session.user);
            } else {
              setUser(null);
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        ErrorLogger.error('Auth initialization failed', error as Error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setUser, setLoading, supabase.auth]);  // Include dependencies in the array

  return <>{children}</>;
}
