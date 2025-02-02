import { metricsAggregationService } from '@/services/metrics-aggregation-service';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdvancedMetricsChart } from '../AdvancedMetricsChart';

// Mock the services
jest.mock('@/services/metrics-aggregation-service');

describe('AdvancedMetricsChart', () => {
  const mockMetrics = ['cpu', 'memory'] as const;
  const mockData = [
    {
      metricType: 'cpu',
      windowSize: '1h',
      startTime: new Date('2024-03-15T00:00:00Z'),
      endTime: new Date('2024-03-15T01:00:00Z'),
      minValue: 10,
      maxValue: 90,
      avgValue: 45,
      count: 60
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (metricsAggregationService.getAggregatedMetrics as jest.Mock).mockResolvedValue(mockData);
  });

  it('renders without crashing', () => {
    render(
      <AdvancedMetricsChart
        metrics={mockMetrics}
        title="Test Chart"
      />
    );
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('loads data on mount', async () => {
    render(
      <AdvancedMetricsChart
        metrics={mockMetrics}
        title="Test Chart"
      />
    );

    await waitFor(() => {
      expect(metricsAggregationService.getAggregatedMetrics).toHaveBeenCalled();
    });
  });

  it('toggles metrics when clicking buttons', async () => {
    render(
      <AdvancedMetricsChart
        metrics={mockMetrics}
        title="Test Chart"
      />
    );

    const cpuButton = screen.getByText('CPU');
    fireEvent.click(cpuButton);

    await waitFor(() => {
      expect(metricsAggregationService.getAggregatedMetrics).toHaveBeenCalledTimes(2);
    });
  });

  it('updates time window when changing select', async () => {
    render(
      <AdvancedMetricsChart
        metrics={mockMetrics}
        title="Test Chart"
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '6h' } });

    await waitFor(() => {
      expect(metricsAggregationService.getAggregatedMetrics).toHaveBeenCalledWith(
        expect.any(String),
        '6h',
        expect.any(Date),
        expect.any(Date)
      );
    });
  });

  it('handles loading state correctly', async () => {
    (metricsAggregationService.getAggregatedMetrics as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockData), 100))
    );

    render(
      <AdvancedMetricsChart
        metrics={mockMetrics}
        title="Test Chart"
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (metricsAggregationService.getAggregatedMetrics as jest.Mock).mockRejectedValue(
      new Error('Test error')
    );

    render(
      <AdvancedMetricsChart
        metrics={mockMetrics}
        title="Test Chart"
      />
    );

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });
}); 