done deon

import { supabase } from '@/lib/supabase/client';
import { render, screen, waitFor } from '@testing-library/react';
import { HealthTimeline } from '../HealthTimeline';

jest.mock('@/lib/supabase/client');

describe('HealthTimeline', () => {
  const mockHealthData = [
    {
      timestamp: '2024-01-01T00:00:00Z',
      status: 'healthy',
      latency: 50,
      errorRate: 0
    },
    {
      timestamp: '2024-01-01T00:01:00Z',
      status: 'degraded',
      latency: 200,
      errorRate: 0.05
    }
  ];

  beforeEach(() => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: mockHealthData, error: null })
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the chart with system health data', async () => {
    render(<HealthTimeline component={null} className="h-[400px]" />);

    await waitFor(() => {
      expect(screen.getByText('System Health History')).toBeInTheDocument();
    });

    expect(supabase.from).toHaveBeenCalledWith('system_health');
  });

  it('should render the chart with component health data', async () => {
    render(<HealthTimeline component="database" className="h-[400px]" />);

    await waitFor(() => {
      expect(screen.getByText('database Health History')).toBeInTheDocument();
    });

    expect(supabase.from).toHaveBeenCalledWith('system_health');
    expect(supabase.from().eq).toHaveBeenCalledWith('component', 'database');
  });

  it('should handle loading state', () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockImplementation(() => new Promise(() => {}))
    });

    render(<HealthTimeline component={null} className="h-[400px]" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    const error = new Error('Failed to load data');
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: null, error })
    });

    render(<HealthTimeline component={null} className="h-[400px]" />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load data/)).toBeInTheDocument();
    });
  });
}); 