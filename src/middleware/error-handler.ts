import { AIError, ExecutionError, ValidationError } from '@/lib/errors/error-types';
import { ErrorLogger } from '@/lib/errors/logger';
import { NextResponse } from 'next/server';

export async function errorHandler(error: unknown) {
  if (error instanceof ValidationError) {
    return new NextResponse(
      JSON.stringify({
        error: 'Validation Error',
        message: error.message,
        code: error.code
      }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  if (error instanceof ExecutionError) {
    return new NextResponse(
      JSON.stringify({
        error: 'Execution Error',
        message: error.message,
        code: error.code
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  if (error instanceof AIError) {
    return new NextResponse(
      JSON.stringify({
        error: 'AI Error',
        message: error.message,
        code: error.code
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Log unknown errors
  ErrorLogger.error(
    'Unhandled error',
    error instanceof Error ? error : new Error(String(error))
  );

  return new NextResponse(
    JSON.stringify({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }
  );
} 