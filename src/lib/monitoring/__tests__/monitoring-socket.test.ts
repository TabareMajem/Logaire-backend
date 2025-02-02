import { useAuth } from '@/hooks/useAuth';
import { useMonitoringSocket } from '@/hooks/useMonitoringSocket';
import { useToast } from '@/hooks/useToast';
import { act, renderHook } from '@testing-library/react';
import { io } from 'socket.io-client';

jest.mock('@/hooks/useAuth');
jest.mock('@/hooks/useToast');

describe('useMonitoringSocket', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
  };

  const mockSession = {
    access_token: 'mock-token'
  };

  const mockShowToast = jest.fn();

  beforeEach(() => {
    (io as jest.Mock).mockReturnValue(mockSocket);
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
    (useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize socket connection with auth token', () => {
    renderHook(() => useMonitoringSocket());

    expect(io).toHaveBeenCalledWith('/monitoring', {
      path: '/api/monitoring/socket',
      auth: { token: mockSession.access_token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  });

  it('should handle connection events', () => {
    const { result } = renderHook(() => useMonitoringSocket());

    // Simulate connect event
    const connectHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'connect'
    )[1];
    act(() => {
      connectHandler();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should handle connection errors', () => {
    const { result } = renderHook(() => useMonitoringSocket());
    const error = new Error('Connection failed');

    // Simulate connect_error event
    const errorHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'connect_error'
    )[1];
    act(() => {
      errorHandler(error);
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBe(error);
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Failed to connect to monitoring service'
    });
  });

  it('should subscribe to events', () => {
    const { result } = renderHook(() => useMonitoringSocket());
    const mockCallback = jest.fn();
    const events = ['metrics', 'alerts'];

    act(() => {
      result.current.subscribe(events, mockCallback);
    });

    expect(mockSocket.on).toHaveBeenCalledTimes(5); // 3 system events + 2 custom events
  });

  it('should unsubscribe from events', () => {
    const { result } = renderHook(() => useMonitoringSocket());
    const events = ['metrics', 'alerts'];

    act(() => {
      result.current.unsubscribe(events);
    });

    expect(mockSocket.off).toHaveBeenCalledTimes(2);
    events.forEach(event => {
      expect(mockSocket.off).toHaveBeenCalledWith(event);
    });
  });
}); 