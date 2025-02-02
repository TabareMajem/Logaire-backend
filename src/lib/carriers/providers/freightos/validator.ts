done done

import { RateRequest, BookingRequest } from '../../types';
import { FreightosError } from './errors';

export class FreightosValidator {
  validateRateRequest(request: RateRequest): void {
    // Validate origin and destination
    if (!this.isValidLocation(request.origin)) {
      throw FreightosError.validationError('Invalid origin location');
    }
    if (!this.isValidLocation(request.destination)) {
      throw FreightosError.validationError('Invalid destination location');
    }

    // Validate cargo details
    if (!this.isValidCargoDetails(request.cargoDetails)) {
      throw FreightosError.validationError('Invalid cargo details');
    }

    // Validate dates if provided
    if (request.departureDate && !this.isValidDate(request.departureDate)) {
      throw FreightosError.validationError('Invalid departure date');
    }
  }

  validateBookingRequest(request: BookingRequest): void {
    // Validate parties
    if (!this.isValidParty(request.shipper)) {
      throw FreightosError.validationError('Invalid shipper details');
    }
    if (!this.isValidParty(request.consignee)) {
      throw FreightosError.validationError('Invalid consignee details');
    }

    // Validate cargo
    if (!this.isValidCargoDetails(request.cargo)) {
      throw FreightosError.validationError('Invalid cargo details');
    }

    // Validate equipment
    if (!this.isValidEquipment(request.equipment)) {
      throw FreightosError.validationError('Invalid equipment details');
    }
  }

  private isValidLocation(location: any): boolean {
    return (
      location &&
      ((location.type === 'port' && location.code) ||
       (location.type === 'address' && this.isValidAddress(location.address)))
    );
  }

  private isValidAddress(address: any): boolean {
    return (
      address &&
      address.street &&
      address.city &&
      address.country
    );
  }

  private isValidCargoDetails(cargo: any): boolean {
    return (
      cargo &&
      cargo.weight > 0 &&
      cargo.weightUnit &&
      (cargo.containerType || cargo.packages?.length > 0)
    );
  }

  private isValidParty(party: any): boolean {
    return (
      party &&
      party.name &&
      party.address &&
      party.contact?.email
    );
  }

  private isValidEquipment(equipment: any): boolean {
    return (
      equipment &&
      equipment.type &&
      equipment.quantity > 0
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