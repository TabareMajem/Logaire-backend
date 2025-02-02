import { supabase } from '@/lib/supabase/client';
import { rolePermissions, Permission } from './roles';
import { ErrorLogger } from '@/lib/errors/logger';

export class PermissionManager {
  private static supabase = supabase;

  static async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return rolePermissions[user.role] || [];
    } catch (error) {
      ErrorLogger.error('Failed to get user permissions', error as Error);
      return [];
    }
  }

  static hasPermission(permissions: Permission[], action: string, subject: string): boolean {
    return permissions.some(permission => 
      (permission.action === action || permission.action === 'manage') &&
      (permission.subject === subject || permission.subject === 'all')
    );
  }

  static async updateUserRole(userId: string, role: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('users')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to update user role', error as Error);
      throw error;
    }
  }
}