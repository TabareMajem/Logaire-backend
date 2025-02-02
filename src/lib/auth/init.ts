// src/lib/auth/init.ts -->

import { setupDemoAccount } from '@/lib/demo/setup';
import { ErrorLogger } from '@/lib/errors/logger';

export async function initializeAuth() {
  try {
    // Set up demo account
    await setupDemoAccount();
    
    // Add any other auth initialization here
  } catch (error) {
    ErrorLogger.error('Auth initialization failed', error as Error);
  }
}
