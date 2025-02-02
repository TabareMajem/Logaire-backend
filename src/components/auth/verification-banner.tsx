"use client";

import { useAuthStore } from '@/lib/auth/auth-store';
import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';

export function VerificationBanner() {
  const { user } = useAuthStore();

  if (!user || user.email_confirmed_at) {
    return null;
  }

  return (
    <Alert className="mb-6">
      <div className="flex items-center justify-between">
        <p>Please verify your email address to access all features.</p>
        <Button variant="outline" size="sm">
          Resend Verification
        </Button>
      </div>
    </Alert>
  );
}