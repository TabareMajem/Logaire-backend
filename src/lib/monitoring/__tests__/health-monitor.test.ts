import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { SystemHealthMonitor } from '../health/system-health-monitor';

jest.mock('@/lib/supabase/client');
jest.mock('@/lib/errors/logger');

describe('SystemHealthMonitor', () => {
  let healthMonitor: SystemHealthMonitor;

  beforeEach(() => {
    jest.clearAllMocks();
    healthMonitor = SystemHealthMonitor.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = SystemHealthMonitor.getInstance();
    const instance2 = SystemHealthMonitor.getInstance();
    expect(instance1).toBe(instance2);
  });

  describe('checkSystemHealth', () => {
    it('should aggregate component health checks', async () => {
      const mockDbResponse = { data: null, error: null };
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockDbResponse)
        })
      });

      const status = await healthMonitor.checkSystemHealth();

      expect(status.status).toBeDefined();
      expect(status.components).toBeDefined();
      expect(status.lastUpdated).toBeInstanceOf(Date);
    });

    it('should handle component check errors', async () => {
      const mockError = new Error('Database error');
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockRejectedValue(mockError)
        })
      });

      const status = await healthMonitor.checkSystemHealth();

      expect(status.components.database.status).toBe('unhealthy');
      expect(ErrorLogger.error).toHaveBeenCalledWith(
        'Health check failed',
        expect.any(Error)
      );
    });
  });

  describe('monitoring lifecycle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start and stop monitoring', () => {
      const checkSpy = jest.spyOn(healthMonitor, 'checkSystemHealth');
      
      healthMonitor.startMonitoring(1000);
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);

      jest.advanceTimersByTime(1000);
      expect(checkSpy).toHaveBeenCalled();

      healthMonitor.stopMonitoring();
      jest.advanceTimersByTime(1000);
      expect(checkSpy).toHaveBeenCalledTimes(1);
    });
  });
}); 