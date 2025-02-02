export const mockData = {
  shipments: [
    {
      id: 'SHP001',
      origin: 'Los Angeles (LAX)',
      destination: 'Tokyo (NRT)',
      status: 'In Transit',
      eta: '2024-03-15',
      type: 'Express'
    },
    {
      id: 'SHP002',
      origin: 'London (LHR)',
      destination: 'Dubai (DXB)',
      status: 'Scheduled',
      eta: '2024-03-16',
      type: 'Standard'
    },
    {
      id: 'SHP003',
      origin: 'Singapore (SIN)',
      destination: 'Sydney (SYD)',
      status: 'Customs',
      eta: '2024-03-14',
      type: 'Express'
    }
  ],
  activities: [
    {
      id: 1,
      type: 'shipment',
      message: 'New shipment booked LAX → NRT',
      timestamp: new Date(Date.now() - 1000 * 60 * 15)
    },
    {
      id: 2,
      type: 'tracking',
      message: 'Shipment SHP001 arrived at customs',
      timestamp: new Date(Date.now() - 1000 * 60 * 45)
    },
    {
      id: 3,
      type: 'document',
      message: 'AWB generated for SHP002',
      timestamp: new Date(Date.now() - 1000 * 60 * 120)
    }
  ],
  metrics: {
    activeShipments: 24,
    onTimeDelivery: 98.5,
    costSavings: 45280,
    completedBookings: 156
  }
};