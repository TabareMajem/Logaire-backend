// src/app/(auth)/login/page.tsx -->

"use client";

import { LoginForm } from '@/components/auth/login-form';
import { Shell } from '@/components/auth/shell';

export default function LoginPage() {
  return (
    <Shell
      title="Welcome back"
      description="Sign in to your account"
      href="/auth/register"
      linkText="Don't have an account? Register"
    >
      <LoginForm />
    </Shell>
  );
}