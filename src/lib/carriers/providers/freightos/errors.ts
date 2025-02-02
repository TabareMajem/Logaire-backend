import { CarrierError } from '../../core/errors';

export class FreightosError extends CarrierError {
  constructor(
    message: string,
    code: string,
    details?: unknown
  ) {
    super(message, code, 'freightos', details);
  }

  static rateError(message: string, details?: unknown): FreightosError {
    return new FreightosError(message, 'RATE_ERROR', details);
  }

  static bookingError(message: string, details?: unknown): FreightosError {
    return new FreightosError(message, 'BOOKING_ERROR', details);
  }

  static validationError(message: string, details?: unknown): FreightosError {
    return new FreightosError(message, 'VALIDATION_ERROR', details);
  }
}