"use client";

import { useCallback } from 'react';
import { useAuth } from './use-auth';
import { PermissionManager } from '@/lib/auth/permission-manager';
import { useQuery } from '@tanstack/react-query';

export function usePermissions() {
  const { user } = useAuth();

  const { data: permissions = [] } = useQuery({
    queryKey: ['permissions', user?.id],
    queryFn: () => user ? PermissionManager.getUserPermissions(user.id) : Promise.resolve([]),
    enabled: !!user
  });

  const can = useCallback((action: string, subject: string) => {
    return PermissionManager.hasPermission(permissions, action, subject);
  }, [permissions]);

  return {
    permissions,
    can
  };
}