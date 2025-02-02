import { userPreferencesService } from '@/services/user-preferences-service';
import { act, renderHook } from '@testing-library/react-hooks';
import { useAuth } from '../useAuth';
import { usePreferenceSync } from '../usePreferenceSync';
import { useToast } from '../useToast';

jest.mock('@/services/user-preferences-service');
jest.mock('../useAuth');
jest.mock('../useToast');

describe('usePreferenceSync', () => {
  const mockUser = { id: 'test-user-id' };
  const mockPreferences = {
    theme: 'dark',
    refreshInterval: 30000
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useToast as jest.Mock).mockReturnValue({ showToast: jest.fn() });
    (userPreferencesService.loadPreferences as jest.Mock).mockResolvedValue(mockPreferences);
  });

  it('should load preferences on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePreferenceSync());

    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.preferences).toEqual(mockPreferences);
  });

  it('should update preferences', async () => {
    const updates = { theme: 'light' };
    const updatedPreferences = { ...mockPreferences, ...updates };
    (userPreferencesService.updatePreferences as jest.Mock).mockResolvedValue(updatedPreferences);

    const { result, waitForNextUpdate } = renderHook(() => usePreferenceSync());
    await waitForNextUpdate();

    await act(async () => {
      await result.current.updatePreferences(updates);
    });

    expect(result.current.preferences).toEqual(updatedPreferences);
  });

  it('should handle preference update errors', async () => {
    const mockError = new Error('Update failed');
    (userPreferencesService.updatePreferences as jest.Mock).mockRejectedValue(mockError);
    const showToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({ showToast });

    const { result, waitForNextUpdate } = renderHook(() => usePreferenceSync());
    await waitForNextUpdate();

    await act(async () => {
      await result.current.updatePreferences({ theme: 'light' });
    });

    expect(showToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Failed to update preferences'
    });
  });

  it('should sync preferences across tabs/windows', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePreferenceSync());
    await waitForNextUpdate();

    const updatedPreferences = { ...mockPreferences, theme: 'light' };
    act(() => {
      userPreferencesService.emit('preferencesUpdated', {
        userId: mockUser.id,
        preferences: updatedPreferences
      });
    });

    expect(result.current.preferences).toEqual(updatedPreferences);
  });
}); 