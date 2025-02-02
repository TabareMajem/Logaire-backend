import { RateRequest, Rate } from '@/lib/carriers/types';
import { CargoAIQuoteRequest, CargoAIRate } from './types';

export function mapToCargoAIRequest(request: RateRequest): CargoAIQuoteRequest {
  return {
    origin: {
      airportCode: request.origin.code,
      country: request.origin.country
    },
    destination: {
      airportCode: request.destination.code,
      country: request.destination.country
    },
    shipment: {
      pieces: request.cargoDetails.packages?.[0]?.quantity || 1,
      weight: request.cargoDetails.weight,
      weightUnit: request.cargoDetails.weightUnit,
      volume: request.cargoDetails.packages?.[0]?.volume,
      volumeUnit: 'CBM',
      commodityCode: request.cargoDetails.commodity,
      dangerousGoods: request.cargoDetails.hazardous ? {
        unNumber: 'UN1234', // Example
        class: '9'
      } : undefined
    },
    preferences: {
      productTypes: request.preferences?.serviceTypes,
      airlines: request.preferences?.carriers,
      transitTime: request.preferences?.transitTime
    },
    scheduledDate: request.departureDate?.toISOString() || new Date().toISOString()
  };
}

export function mapFromCargoAIResponse(rates: CargoAIRate[], aggregatorId: string): Rate[] {
  return rates.map(rate => ({
    carrierId: rate.airline.code,
    aggregatorId,
    serviceType: rate.product.type,
    serviceName: rate.product.name,
    price: {
      amount: rate.pricing.totalRate.amount,
      currency: rate.pricing.totalRate.currency,
      breakdown: {
        baseRate: rate.pricing.baseRate,
        surcharges: rate.pricing.surcharges.reduce((acc, surcharge) => ({
          ...acc,
          [surcharge.code]: surcharge.amount
        }), {})
      }
    },
    transitTime: {
      min: rate.product.transitTime,
      max: rate.product.transitTime,
      unit: 'days'
    },
    validity: {
      start: new Date(),
      end: new Date(rate.validUntil)
    },
    schedule: rate.routing.segments.map(segment => ({
      origin: segment.origin,
      destination: segment.destination,
      departure: new Date(segment.departure),
      arrival: new Date(segment.arrival),
      flightNumber: segment.flightNumber
    })),
    availability: rate.capacity.status === 'available' ? 1 :
                 rate.capacity.status === 'limited' ? 0.5 : 0
  }));
}