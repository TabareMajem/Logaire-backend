export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
} as const;

export const PERMISSIONS = {
  dashboard: {
    read: ['admin', 'manager', 'user']
  },
  shipments: {
    create: ['admin', 'manager'],
    read: ['admin', 'manager', 'user'],
    update: ['admin', 'manager'],
    delete: ['admin']
  },
  carriers: {
    read: ['admin', 'manager', 'user'],
    manage: ['admin', 'manager']
  },
  integrations: {
    read: ['admin', 'manager', 'user'],
    manage: ['admin']
  },
  settings: {
    read: ['admin', 'manager', 'user'],
    manage: ['admin']
  }
} as const;

export function hasPermission(
  userRole: keyof typeof ROLES,
  action: string,
  subject: string
): boolean {
  const permissionConfig = PERMISSIONS[subject as keyof typeof PERMISSIONS];
  if (!permissionConfig) return false;

  const allowedRoles = permissionConfig[action as keyof typeof permissionConfig];
  if (!allowedRoles) return false;

  return allowedRoles.includes(userRole as typeof ROLES[keyof typeof ROLES]);
}