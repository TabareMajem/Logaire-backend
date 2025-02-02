done done

import { RateRequest, Rate } from '../../types';
import { FreightosRateRequest, FreightosRateResponse } from './types';

export function mapToFreightosRequest(request: RateRequest): FreightosRateRequest {
  return {
    origin: {
      type: request.origin.type,
      code: request.origin.code,
      address: request.origin.address
    },
    destination: {
      type: request.destination.type,
      code: request.destination.code,
      address: request.destination.address
    },
    cargo: {
      type: request.cargoDetails.containerType ? 'FCL' : 'LCL',
      ...(request.cargoDetails.containerType && {
        containers: [{
          type: request.cargoDetails.containerType,
          quantity: request.cargoDetails.quantity || 1
        }]
      }),
      ...(request.cargoDetails.packages && {
        packages: request.cargoDetails.packages
      }),
      totalWeight: request.cargoDetails.weight,
      weightUnit: request.cargoDetails.weightUnit,
      dangerousGoods: request.cargoDetails.hazardous || false,
      commodity: request.cargoDetails.commodity
    },
    preferences: {
      carriers: request.preferences?.carriers,
      transitTime: request.preferences?.transitTime,
      serviceTypes: request.preferences?.serviceTypes
    }
  };
}

export function mapFromFreightosResponse(response: FreightosRateResponse, aggregatorId: string): Rate[] {
  return response.quotes.map(quote => ({
    id: quote.id,
    carrierId: quote.carrier.code,
    aggregatorId,
    serviceType: quote.service.type,
    serviceName: quote.service.name,
    price: {
      amount: quote.rates.totalRate.amount,
      currency: quote.rates.totalRate.currency,
      breakdown: {
        baseRate: quote.rates.baseRate,
        surcharges: quote.rates.surcharges.reduce((acc, surcharge) => ({
          ...acc,
          [surcharge.code]: {
            amount: surcharge.amount,
            currency: surcharge.currency
          }
        }), {})
      }
    },
    transitTime: {
      min: quote.service.transitTime.min,
      max: quote.service.transitTime.max,
      unit: quote.service.transitTime.unit.toLowerCase() as 'days' | 'hours'
    },
    routing: {
      origin: mapLocation(quote.routing.origin),
      destination: mapLocation(quote.routing.destination),
      transshipments: quote.routing.transshipments?.map(mapLocation)
    },
    validity: {
      start: new Date(quote.validity.start),
      end: new Date(quote.validity.end)
    },
    availability: {
      equipment: quote.availability.equipment,
      space: quote.availability.space
    }
  }));
}

function mapLocation(location: FreightosLocation) {
  return {
    type: location.type,
    code: location.code,
    name: location.name,
    country: location.country,
    coordinates: location.coordinates,
    address: location.address
  };
}