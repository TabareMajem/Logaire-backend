// sec/components/monitoring/health/__tests__/HealthDashboard.test.tsx -->
import { useMonitoringSocket } from '@/hooks/useMonitoringSocket';
import { useToast } from '@/hooks/useToast';
import { SystemHealthMonitor } from '@/lib/monitoring/health/system-health-monitor';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HealthDashboard } from '../HealthDashboard';

// Mock dependencies
jest.mock('@/hooks/useMonitoringSocket');
jest.mock('@/hooks/useToast');
jest.mock('@/lib/monitoring/health/system-health-monitor');

describe('HealthDashboard', () => {
  // Define reusable mock data
  const mockHealthStatus = {
    status: 'healthy',
    components: {
      database: {
        status: 'healthy',
        latency: 50,
        lastCheck: new Date(),
      },
      api: {
        status: 'degraded',
        latency: 200,
        lastCheck: new Date(),
      },
    },
    lastUpdated: new Date(),
  };

  const mockSocket = {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    isConnected: true,
    error: null,
  };

  const mockShowToast = jest.fn();

  beforeEach(() => {
    // Set up mocks before each test
    (useMonitoringSocket as jest.Mock).mockReturnValue(mockSocket);
    (useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
    (SystemHealthMonitor.getInstance as jest.Mock).mockReturnValue({
      checkSystemHealth: jest.fn().mockResolvedValue(mockHealthStatus),
    });
  });

  afterEach(() => {
    // Clear mocks after each test to avoid interference
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<HealthDashboard />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders health status when loaded', async () => {
    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Overall Status')).toBeInTheDocument();
      expect(screen.getByText('Active Components')).toBeInTheDocument();
      expect(screen.getByText('Healthy Components')).toBeInTheDocument();
    });
  });

  it('handles component selection', async () => {
    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('database')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('database'));

    expect(screen.getByText('50ms')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    const error = new Error('Failed to load health status');
    (SystemHealthMonitor.getInstance as jest.Mock).mockReturnValue({
      checkSystemHealth: jest.fn().mockRejectedValue(error),
    });

    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load health status/)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Failed to load health status',
    });
  });

  it('subscribes to health updates on mount', async () => {
    render(<HealthDashboard />);

    await waitFor(() => {
      expect(mockSocket.subscribe).toHaveBeenCalledWith(
        ['health'],
        expect.any(Function)
      );
    });
  });

  it('unsubscribes on unmount', () => {
    const { unmount } = render(<HealthDashboard />);
    unmount();

    expect(mockSocket.unsubscribe).toHaveBeenCalledWith(['health']);
  });

  it('handles retry action after error', async () => {
    const error = new Error('Failed to load health status');
    const checkHealthMock = jest
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(mockHealthStatus);

    (SystemHealthMonitor.getInstance as jest.Mock).mockReturnValue({
      checkSystemHealth: checkHealthMock,
    });

    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Retry'));

    await waitFor(() => {
      expect(checkHealthMock).toHaveBeenCalledTimes(2);
      expect(screen.getByText('Overall Status')).toBeInTheDocument();
    });
  });
});
