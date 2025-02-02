import { supabase } from '@/lib/supabase/client';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { metricsAggregationService } from '../metrics-aggregation-service';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis()
  }
}));

describe('MetricsAggregationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startAggregation', () => {
    it('should start aggregation for the specified metric type', () => {
      const metricType = 'cpu';
      
      metricsAggregationService.startAggregation(metricType);
      
      // Verify that aggregation was started
      expect(supabase.rpc).toHaveBeenCalledWith(
        'aggregate_metrics',
        expect.any(Object)
      );
    });

    it('should not start duplicate aggregations', () => {
      const metricType = 'memory';
      
      metricsAggregationService.startAggregation(metricType);
      metricsAggregationService.startAggregation(metricType);
      
      // Verify that aggregation was only started once
      expect(supabase.rpc).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAggregatedMetrics', () => {
    it('should fetch aggregated metrics with correct parameters', async () => {
      const mockData = [
        {
          metric_type: 'cpu',
          window_size: '5m',
          start_time: '2024-03-15T00:00:00Z',
          end_time: '2024-03-15T00:05:00Z',
          min_value: 10,
          max_value: 90,
          avg_value: 45,
          count: 60
        }
      ];

      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              data: mockData,
              error: null
            })
          })
        })
      }));

      const result = await metricsAggregationService.getAggregatedMetrics(
        'cpu',
        '5m',
        new Date('2024-03-15T00:00:00Z'),
        new Date('2024-03-15T00:05:00Z')
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        metricType: 'cpu',
        windowSize: '5m',
        minValue: 10,
        maxValue: 90,
        avgValue: 45,
        count: 60
      });
    });

    it('should handle errors when fetching metrics', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              data: null,
              error: new Error('Database error')
            })
          })
        })
      }));

      await expect(
        metricsAggregationService.getAggregatedMetrics('cpu', '5m')
      ).rejects.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should call cleanup procedure with correct retention days', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

      await metricsAggregationService.cleanup(15);

      expect(supabase.rpc).toHaveBeenCalledWith(
        'cleanup_old_aggregations',
        { p_retention_days: 15 }
      );
    });

    it('should use default retention days if not specified', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

      await metricsAggregationService.cleanup();

      expect(supabase.rpc).toHaveBeenCalledWith(
        'cleanup_old_aggregations',
        { p_retention_days: 30 }
      );
    });
  });
}); 