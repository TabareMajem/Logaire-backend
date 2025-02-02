import { CargoDetails, Location } from './types';
import { CarrierError } from './errors';

export function validateLocation(location: Location, carrier: string): void {
  if (!location.code && !location.address) {
    throw CarrierError.validationError(
      'Location must have either a code or address',
      carrier
    );
  }

  if (location.address) {
    if (!location.address.street || !location.address.city || !location.address.country) {
      throw CarrierError.validationError(
        'Address must include street, city, and country',
        carrier
      );
    }
  }

  if (location.coordinates) {
    const [lon, lat] = location.coordinates;
    if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
      throw CarrierError.validationError(
        'Invalid coordinates',
        carrier
      );
    }
  }
}

export function validateCargoDetails(cargo: CargoDetails, carrier: string): void {
  if (cargo.weight <= 0) {
    throw CarrierError.validationError(
      'Weight must be greater than 0',
      carrier
    );
  }

  if (!['KG', 'LB'].includes(cargo.weightUnit)) {
    throw CarrierError.validationError(
      'Invalid weight unit',
      carrier
    );
  }

  if (cargo.containerType && !isValidContainerType(cargo.containerType)) {
    throw CarrierError.validationError(
      'Invalid container type',
      carrier
    );
  }

  if (cargo.temperature) {
    validateTemperature(cargo.temperature, carrier);
  }

  if (cargo.packages) {
    validatePackages(cargo.packages, carrier);
  }
}

function isValidContainerType(type: string): boolean {
  const validTypes = ['20GP', '40GP', '40HC', '45HC'];
  return validTypes.includes(type);
}

function validateTemperature(
  temp: { min: number; max: number; unit: 'C' | 'F' },
  carrier: string
): void {
  if (temp.min > temp.max) {
    throw CarrierError.validationError(
      'Minimum temperature cannot be greater than maximum',
      carrier
    );
  }

  if (!['C', 'F'].includes(temp.unit)) {
    throw CarrierError.validationError(
      'Invalid temperature unit',
      carrier
    );
  }
}

function validatePackages(
  packages: CargoDetails['packages'],
  carrier: string
): void {
  if (!packages?.length) {
    throw CarrierError.validationError(
      'At least one package is required',
      carrier
    );
  }

  for (const pkg of packages) {
    if (pkg.quantity <= 0) {
      throw CarrierError.validationError(
        'Package quantity must be greater than 0',
        carrier
      );
    }

    if (pkg.weight <= 0) {
      throw CarrierError.validationError(
        'Package weight must be greater than 0',
        carrier
      );
    }

    if (pkg.length <= 0 || pkg.width <= 0 || pkg.height <= 0) {
      throw CarrierError.validationError(
        'Package dimensions must be greater than 0',
        carrier
      );
    }
  }
}