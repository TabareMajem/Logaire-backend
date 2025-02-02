export const apiEndpoints = [
  {
    method: 'POST',
    path: '/v1/shipments',
    description: 'Create a new shipment',
    auth: true,
    request: {
      origin: {
        name: 'Port of Los Angeles',
        coordinates: [-118.2437, 33.7288]
      },
      destination: {
        name: 'Port of Shanghai',
        coordinates: [121.4737, 31.2304]
      },
      cargo: {
        type: 'FCL',
        weight: 1000,
        volume: 33.2
      }
    },
    response: {
      id: 'ship_123abc',
      status: 'created',
      tracking_number: 'TRK123456789',
      estimated_delivery: '2024-03-15T00:00:00Z'
    }
  },
  {
    method: 'GET',
    path: '/v1/shipments/{id}',
    description: 'Retrieve shipment details',
    auth: true,
    request: {},
    response: {
      id: 'ship_123abc',
      status: 'in_transit',
      origin: {
        name: 'Port of Los Angeles',
        coordinates: [-118.2437, 33.7288]
      },
      destination: {
        name: 'Port of Shanghai',
        coordinates: [121.4737, 31.2304]
      },
      current_location: {
        name: 'Pacific Ocean',
        coordinates: [-170.6432, 25.7234]
      }
    }
  },
  {
    method: 'GET',
    path: '/v1/rates',
    description: 'Get shipping rates',
    auth: true,
    request: {
      origin: 'USLAX',
      destination: 'CNSHA',
      cargo_type: 'FCL',
      container_size: '40HC'
    },
    response: {
      rates: [
        {
          carrier: 'Maersk',
          amount: 4500,
          currency: 'USD',
          transit_time: 14,
          valid_until: '2024-03-01T00:00:00Z'
        },
        {
          carrier: 'MSC',
          amount: 4200,
          currency: 'USD',
          transit_time: 16,
          valid_until: '2024-03-01T00:00:00Z'
        }
      ]
    }
  }
];