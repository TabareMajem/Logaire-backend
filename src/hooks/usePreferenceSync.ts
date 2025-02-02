import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { userPreferencesService } from '@/services/user-preferences-service';
import { useEffect, useState } from 'react';

export function usePreferenceSync() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      loadPreferences();
      const unsubscribe = userPreferencesService.onPreferencesUpdated((event) => {
        if (event.userId === user.id) {
          setPreferences(event.preferences);
        }
      });
      return unsubscribe;
    }
  }, [user?.id]);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const prefs = await userPreferencesService.loadPreferences(user!.id);
      setPreferences(prefs);
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to load preferences'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (updates: any) => {
    try {
      const updated = await userPreferencesService.updatePreferences(user!.id, updates);
      setPreferences(updated);
      showToast({
        type: 'success',
        message: 'Preferences updated successfully'
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to update preferences'
      });
    }
  };

  return {
    preferences,
    isLoading,
    updatePreferences
  };
} 