import { ErrorLogger } from '@/lib/errors/logger';

export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AIError';
  }

  static validation(message: string, details?: unknown): AIError {
    return new AIError(message, 'VALIDATION_ERROR', details);
  }

  static execution(message: string, details?: unknown): AIError {
    return new AIError(message, 'EXECUTION_ERROR', details);
  }

  static rateLimit(message: string): AIError {
    return new AIError(message, 'RATE_LIMIT');
  }
}

export function handleAIError(error: unknown, context?: Record<string, any>): never {
  if (error instanceof AIError) {
    ErrorLogger.error(error.message, error, {
      code: error.code,
      details: error.details,
      ...context
    });
  } else {
    ErrorLogger.error('Unexpected AI error', error as Error, context);
  }

  throw error;
}

export function wrapError(error: unknown, message: string): AIError {
  if (error instanceof AIError) {
    return error;
  }

  return AIError.execution(message, {
    originalError: error instanceof Error ? error.message : String(error)
  });
}