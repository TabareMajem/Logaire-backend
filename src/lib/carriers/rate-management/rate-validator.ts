done done

import { RateRequest } from '../types';
import { CarrierError } from '../errors';

export class RateValidator {
  validateRequest(request: RateRequest): void {
    this.validateLocation(request.origin, 'Origin');
    this.validateLocation(request.destination, 'Destination');
    this.validateCargoDetails(request.cargoDetails);
    
    if (request.equipmentType) {
      this.validateEquipmentType(request.equipmentType);
    }
  }

  private validateLocation(location: any, type: string): void {
    if (!location?.code || !location?.name) {
      throw new CarrierError(
        `Invalid ${type.toLowerCase()}: missing required fields`,
        'VALIDATION_ERROR',
        'rate-validator'
      );
    }
  }

  private validateCargoDetails(cargo: any): void {
    if (!cargo?.type || !cargo?.weight) {
      throw new CarrierError(
        'Invalid cargo details: missing required fields',
        'VALIDATION_ERROR',
        'rate-validator'
      );
    }

    if (cargo.weight <= 0) {
      throw new CarrierError(
        'Invalid cargo weight: must be greater than 0',
        'VALIDATION_ERROR',
        'rate-validator'
      );
    }
  }

  private validateEquipmentType(type: string): void {
    const validTypes = ['20GP', '40GP', '40HC', '45HC'];
    if (!validTypes.includes(type)) {
      throw new CarrierError(
        'Invalid equipment type',
        'VALIDATION_ERROR',
        'rate-validator'
      );
    }
  }
}