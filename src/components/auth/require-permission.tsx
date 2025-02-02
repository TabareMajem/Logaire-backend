"use client";

import { usePermissions } from '@/hooks/use-permissions';

interface RequirePermissionProps {
  action: string;
  subject: string;
  children: React.ReactNode;
}

export function RequirePermission({ action, subject, children }: RequirePermissionProps) {
  const { can } = usePermissions();

  if (!can(action, subject)) {
    return null;
  }

  return <>{children}</>;
}