import { RateRequest, Rate } from '../../types';
import { CmaCgmRateRequest, CmaCgmRateResponse } from './types';

export function mapToCmaCgmRequest(request: RateRequest): CmaCgmRateRequest {
  return {
    origin: {
      code: request.origin.code!,
      terminal: request.origin.country
    },
    destination: {
      code: request.destination.code!,
      terminal: request.origin.country
    },
    equipment: {
      type: request.cargoDetails.containerType!,
      size: request.cargoDetails.containerSize!,
      quantity: request.cargoDetails.quantity!
    },
    cargo: {
      weight: request.cargoDetails.weight,
      weightUnit: request.cargoDetails.weightUnit,
      type: request.cargoDetails.commodity!,
      dangerous: request.cargoDetails.hazardous,
      ...(request.cargoDetails.temperature && {
        temperature: {
          value: request.cargoDetails.temperature.min,
          unit: request.cargoDetails.temperature.unit
        }
      })
    },
    departureDate: request.departureDate?.toISOString()
  };
}

export function mapFromCmaCgmResponse(response: CmaCgmRateResponse, carrierId: string): Rate[] {
  return response.rates.map(rate => ({
    carrierId,
    serviceType: rate.service,
    price: {
      amount: rate.amount,
      currency: rate.currencyCode,
      breakdown: rate.surcharges.reduce((acc, surcharge) => ({
        ...acc,
        [surcharge.code]: surcharge.amount
      }), {})
    },
    transitTime: {
      min: rate.transitDays,
      max: rate.transitDays,
      unit: 'days'
    },
    validity: {
      start: new Date(),
      end: new Date(rate.validityEnd)
    },
    schedule: {
      departure: new Date(rate.schedule.etd),
      arrival: new Date(rate.schedule.eta),
      vessel: rate.schedule.vessel
    }
  }));
}