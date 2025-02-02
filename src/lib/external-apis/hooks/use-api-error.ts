"use client";

import { useToast } from '@/hooks/use-toast';
import { ExternalAPIError } from '../errors';
import { ErrorLogger } from '@/lib/errors/logger';

export function useAPIErrorHandler() {
  const { toast } = useToast();

  return (error: unknown, context?: string) => {
    if (error instanceof ExternalAPIError) {
      const message = `API Error: ${error.message}`;
      toast.error(message);
      ErrorLogger.error(message, error, { context });
      return;
    }

    const message = 'An unexpected error occurred';
    toast.error(message);
    ErrorLogger.error(message, error as Error, { context });
  };
}