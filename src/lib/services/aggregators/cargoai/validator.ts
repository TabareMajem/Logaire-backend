import { RateRequest } from '@/lib/carriers/types';
import { CargoAIError } from './errors';

export class CargoAIValidator {
  validateRateRequest(request: RateRequest): void {
    // Validate origin and destination
    if (!request.origin.code || !request.destination.code) {
      throw CargoAIError.validationError('Origin and destination airport codes are required');
    }

    // Validate cargo details
    if (!this.isValidCargoDetails(request.cargoDetails)) {
      throw CargoAIError.validationError('Invalid cargo details');
    }

    // Validate dates if provided
    if (request.departureDate && !this.isValidDate(request.departureDate)) {
      throw CargoAIError.validationError('Invalid departure date');
    }
  }

  private isValidCargoDetails(cargo: any): boolean {
    return (
      cargo &&
      cargo.weight > 0 &&
      ['KG', 'LB'].includes(cargo.weightUnit)
    );
  }

  private isValidDate(date: Date): boolean {
    return (
      date instanceof Date &&
      !isNaN(date.getTime()) &&
      date >= new Date()
    );
  }
}