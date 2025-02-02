"use client";

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/lib/auth/session-store';
import { SessionManager } from '@/lib/auth/session-manager';
import { useToast } from '@/hooks/use-toast';

export function useSession() {
  const { session } = useSessionStore();
  const router = useRouter();
  const { toast } = useToast();

  const logout = useCallback(async () => {
    try {
      await SessionManager.logout();
      router.push('/auth/login');
      toast.success('Successfully logged out');
    } catch (error) {
      toast.error('Failed to logout');
    }
  }, [router, toast]);

  return {
    session,
    isAuthenticated: !!session,
    user: session?.user ?? null,
    logout,
  };
}