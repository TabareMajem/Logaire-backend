export type Permission = {
  action: string;
  subject: string;
};

export const rolePermissions: Record<string, Permission[]> = {
  admin: [
    { action: 'manage', subject: 'all' }
  ],
  manager: [
    { action: 'read', subject: 'dashboard' },
    { action: 'create', subject: 'shipments' },
    { action: 'read', subject: 'shipments' },
    { action: 'update', subject: 'shipments' },
    { action: 'create', subject: 'bookings' },
    { action: 'read', subject: 'bookings' },
    { action: 'update', subject: 'bookings' },
    { action: 'read', subject: 'reports' }
  ],
  user: [
    { action: 'read', subject: 'dashboard' },
    { action: 'read', subject: 'shipments' },
    { action: 'read', subject: 'bookings' }
  ]
};