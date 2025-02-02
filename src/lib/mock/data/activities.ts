export const mockActivities = [
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
];