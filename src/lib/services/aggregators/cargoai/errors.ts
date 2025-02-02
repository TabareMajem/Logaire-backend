import { CarrierError } from '@/lib/carriers/core/errors';

export class CargoAIError extends CarrierError {
  constructor(
    message: string,
    code: string,
    details?: unknown
  ) {
    super(message, code, 'cargoai', details);
  }

  static authError(message: string, details?: unknown): CargoAIError {
    return new CargoAIError(message, 'AUTH_ERROR', details);
  }

  static rateError(message: string, details?: unknown): CargoAIError {
    return new CargoAIError(message, 'RATE_ERROR', details);
  }

  static validationError(message: string, details?: unknown): CargoAIError {
    return new CargoAIError(message, 'VALIDATION_ERROR', details);
  }
}