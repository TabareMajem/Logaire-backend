import { MockAuthService } from '../mock/auth-service';
import { ErrorLogger } from '@/lib/errors/logger';

export class DemoService {
  static async createDemoSession(): Promise<void> {
    try {
      await MockAuthService.createDemoSession();
    } catch (error) {
      ErrorLogger.error('Demo session creation failed', error as Error);
      throw error;
    }
  }

  static async isDemoUser(): Promise<boolean> {
    try {
      const user = await MockAuthService.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }
}