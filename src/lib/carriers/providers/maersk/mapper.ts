done done

import { RateRequest, Rate } from '../../types';
import { MaerskRateRequest, MaerskRateResponse } from './types';

export function mapToMaerskRequest(request: RateRequest): MaerskRateRequest {
  return {
    origin: {
      unlocode: request.origin.code,
      facility: request.origin.facility
    },
    destination: {
      unlocode: request.destination.code,
      facility: request.destination.facility
    },
    containerDetails: [{
      equipmentSize: request.cargoDetails.containerSize,
      equipmentType: request.cargoDetails.containerType,
      quantity: request.cargoDetails.quantity
    }],
    cargoDetails: {
      weight: request.cargoDetails.weight,
      weightUnit: request.cargoDetails.weightUnit,
      commodity: request.cargoDetails.commodity,
      hsCode: request.cargoDetails.hsCode
    },
    scheduledDate: request.departureDate?.toISOString() || new Date().toISOString()
  };
}

export function mapFromMaerskResponse(response: MaerskRateResponse, carrierId: string): Rate[] {
  return response.quotes.map(quote => ({
    carrierId,
    serviceType: quote.serviceType,
    price: {
      amount: quote.price.amount,
      currency: quote.price.currency,
      breakdown: quote.price.charges
    },
    transitTime: {
      min: quote.transitTime.duration,
      max: quote.transitTime.duration,
      unit: quote.transitTime.unit.toLowerCase() as 'days' | 'hours'
    },
    validity: {
      start: new Date(),
      end: new Date(quote.validUntil)
    },
    schedule: {
      departure: new Date(quote.routing.departureDate),
      arrival: new Date(quote.routing.arrivalDate),
      vessel: quote.routing.vessel
    }
  }));
}