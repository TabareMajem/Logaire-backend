done done

import { BaseCarrier } from '../../base-carrier';
import { Rate, Location, CargoDetails } from '../../types';
import { validateLocation, validateCargoDetails } from '../../validation';
import { MscRateRequest, MscRateResponse } from './types';
import { mapMscRates } from './mapper';
import { CarrierError } from '../../errors';

export class MscCarrier extends BaseCarrier {
  async getRates(params: {
    origin: Location;
    destination: Location;
    cargo: CargoDetails;
    departureDate?: Date;
  }): Promise<Rate[]> {
    validateLocation(params.origin, this.config.code);
    validateLocation(params.destination, this.config.code);
    validateCargoDetails(params.cargo, this.config.code);

    const request: MscRateRequest = {
      fromPort: params.origin.code,
      toPort: params.destination.code,
      containerSize: params.cargo.containerType || '40HC',
      cargoWeight: params.cargo.weight,
      cargoType: params.cargo.type,
      preferredDate: params.departureDate?.toISOString(),
      ...(params.cargo.temperature && {
        specialRequirements: {
          reefer: true,
          temperature: {
            min: params.cargo.temperature.min,
            max: params.cargo.temperature.max,
            unit: params.cargo.temperature.unit
          }
        }
      }),
      ...(params.cargo.hazardous && {
        specialRequirements: {
          hazardous: true
        }
      })
    };

    try {
      const response = await this.makeRequest<MscRateResponse>('/rates/quote', {
        method: 'POST',
        body: JSON.stringify(request)
      });

      return mapMscRates(response, this.config.code);
    } catch (error) {
      if (error instanceof CarrierError) {
        throw error;
      }
      throw CarrierError.connectionError(this.config.code, error as Error);
    }
  }
}