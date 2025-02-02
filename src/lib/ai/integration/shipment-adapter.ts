// src/lib/ai/adapters/shipment-adapter.ts

import { ShipmentDetails } from '../types/optimization';
import { Shipment, Route } from '../types/shipment';
import { v4 as uuidv4 } from 'uuid';  // You'll need to install this package

export class ShipmentAdapter {
  static toShipment(details: ShipmentDetails): Shipment {
    // Create a basic Route object from ShipmentDetails
    const route: Route = {
      id: uuidv4(),
      origin: {
        name: details.origin.name,
        coordinates: details.origin.coordinates,
        type: details.origin.type || 'other',
        code: details.origin.code || details.origin.name
      },
      destination: {
        name: details.destination.name,
        coordinates: details.destination.coordinates,
        type: details.destination.type || 'other',
        code: details.destination.code || details.destination.name
      },
      via: [],
      estimatedDuration: 0, // Will be calculated by routing agent
      estimatedCost: 0,     // Will be calculated by rate agent
      distance: 0,          // Will be calculated by routing agent
      carbonEmissions: 0,   // Will be calculated
      risks: []            // Will be assessed by risk agent
    };

    // Create Shipment object
    const shipment: Shipment = {
      id: uuidv4(),
      origin: details.origin.name,
      destination: details.destination.name,
      route: route,
      status: 'pending',
      schedule: {
        pickupDate: details.scheduleConstraints.earliestPickup?.toISOString() || new Date().toISOString(),
        deliveryDate: details.scheduleConstraints.latestDelivery?.toISOString() || 
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Default to 7 days from now
      },
      cargoDetails: {
        type: details.cargoDetails.type,
        weight: details.cargoDetails.weight,
        volume: details.cargoDetails.volume
      }
    };

    return shipment;
  }
}