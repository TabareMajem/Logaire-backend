"use client";

import { RegisterForm } from '@/components/auth/register-form';
import { Shell } from '@/components/auth/shell';

export default function RegisterPage() {
  return (
    <Shell
      title="Create an account"
      description="Enter your details to create your account"
      href="/auth/login"
      linkText="Already have an account? Login"
    >
      <RegisterForm />
    </Shell>
  );
}