import { RateRequest, Rate } from '../../types';
import { MscRateRequest, MscRateResponse } from './types';

export function mapToMscRequest(request: RateRequest): MscRateRequest {
  return {
    portOfLoading: request.origin.code,
    portOfDischarge: request.destination.code,
    equipmentType: request.cargoDetails.containerType,
    cargoWeight: request.cargoDetails.weight,
    cargoType: request.cargoDetails.commodity,
    preferredDate: request.departureDate?.toISOString(),
    ...(request.cargoDetails.temperature && {
      specialRequirements: {
        reefer: true,
        temperature: {
          min: request.cargoDetails.temperature.min,
          max: request.cargoDetails.temperature.max,
          unit: request.cargoDetails.temperature.unit
        }
      }
    }),
    ...(request.cargoDetails.hazardous && {
      specialRequirements: {
        hazardous: true
      }
    })
  };
}

export function mapFromMscResponse(response: MscRateResponse, carrierId: string): Rate[] {
  return response.quotations.map(quote => ({
    carrierId,
    serviceType: quote.serviceLevel,
    price: {
      amount: quote.baseRate.value + calculateSurcharges(quote.additionalCharges),
      currency: quote.baseRate.currency,
      breakdown: quote.additionalCharges.reduce((acc, charge) => ({
        ...acc,
        [charge.type]: charge.value
      }), {})
    },
    transitTime: {
      min: quote.estimatedTransitTime,
      max: quote.estimatedTransitTime + 2, // Add buffer
      unit: 'days'
    },
    validity: {
      start: new Date(quote.validityPeriod.from),
      end: new Date(quote.validityPeriod.to)
    },
    schedule: quote.vesselSchedule ? {
      departure: new Date(quote.vesselSchedule.departureDate),
      arrival: new Date(quote.vesselSchedule.arrivalDate),
      vessel: quote.vesselSchedule.vesselName
    } : undefined
  }));
}

function calculateSurcharges(charges: Array<{ type: string; value: number }>): number {
  return charges.reduce((total, charge) => total + charge.value, 0);
}