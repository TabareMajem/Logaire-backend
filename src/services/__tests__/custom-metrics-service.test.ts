import { supabase } from '@/lib/supabase/client';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { customMetricsService } from '../custom-metrics-service';
import { metricsAggregationService } from '../metrics-aggregation-service';

jest.mock('@/lib/supabase/client');
jest.mock('../metrics-aggregation-service');

describe('CustomMetricsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDefinition', () => {
    it('should create a new custom metric definition', async () => {
      const mockDefinition = {
        name: 'Test Metric',
        description: 'Test Description',
        formula: JSON.stringify({
          operation: 'avg',
          metrics: ['cpu']
        }),
        baseMetrics: ['cpu'],
        unit: '%',
        enabled: true
      };

      const mockResponse = {
        data: {
          id: '123',
          ...mockDefinition,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        error: null
      };

      (supabase.from as jest.Mock).mockImplementation(() => ({
        insert: () => ({
          select: () => ({
            single: () => mockResponse
          })
        })
      }));

      const result = await customMetricsService.createDefinition(mockDefinition);

      expect(result).toEqual(mockResponse.data);
      expect(supabase.from).toHaveBeenCalledWith('custom_metric_definitions');
    });

    it('should handle errors when creating definition', async () => {
      const mockDefinition = {
        name: 'Test Metric',
        formula: 'invalid',
        baseMetrics: ['cpu'],
        unit: '%',
        enabled: true
      };

      (supabase.from as jest.Mock).mockImplementation(() => ({
        insert: () => ({
          select: () => ({
            single: () => ({ data: null, error: new Error('Database error') })
          })
        })
      }));

      await expect(
        customMetricsService.createDefinition(mockDefinition as any)
      ).rejects.toThrow();
    });
  });

  describe('evaluateMetric', () => {
    it('should correctly evaluate sum operation', async () => {
      const mockDefinition = {
        id: '123',
        name: 'Sum Metric',
        formula: JSON.stringify({
          operation: 'sum',
          metrics: ['cpu', 'memory']
        }),
        baseMetrics: ['cpu', 'memory'],
        unit: '%',
        enabled: true
      };

      (metricsAggregationService.getAggregatedMetrics as jest.Mock)
        .mockResolvedValueOnce([{ avgValue: 50 }])
        .mockResolvedValueOnce([{ avgValue: 30 }]);

      const result = await (customMetricsService as any).evaluateMetric(mockDefinition);
      expect(result).toBe(80); // 50 + 30
    });

    it('should correctly evaluate average operation', async () => {
      const mockDefinition = {
        id: '123',
        name: 'Avg Metric',
        formula: JSON.stringify({
          operation: 'avg',
          metrics: ['cpu', 'memory']
        }),
        baseMetrics: ['cpu', 'memory'],
        unit: '%',
        enabled: true
      };

      (metricsAggregationService.getAggregatedMetrics as jest.Mock)
        .mockResolvedValueOnce([{ avgValue: 60 }])
        .mockResolvedValueOnce([{ avgValue: 40 }]);

      const result = await (customMetricsService as any).evaluateMetric(mockDefinition);
      expect(result).toBe(50); // (60 + 40) / 2
    });
  });

  describe('getDefinitions', () => {
    it('should return all definitions', async () => {
      const mockDefinitions = [
        {
          id: '123',
          name: 'Test Metric 1',
          formula: JSON.stringify({ operation: 'avg', metrics: ['cpu'] }),
          baseMetrics: ['cpu'],
          unit: '%',
          enabled: true
        },
        {
          id: '456',
          name: 'Test Metric 2',
          formula: JSON.stringify({ operation: 'sum', metrics: ['memory'] }),
          baseMetrics: ['memory'],
          unit: 'MB',
          enabled: true
        }
      ];

      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: () => ({
          order: () => ({ data: mockDefinitions, error: null })
        })
      }));

      await (customMetricsService as any).loadDefinitions();
      const definitions = customMetricsService.getDefinitions();

      expect(definitions).toHaveLength(2);
      expect(definitions[0].name).toBe('Test Metric 1');
      expect(definitions[1].name).toBe('Test Metric 2');
    });
  });
}); 