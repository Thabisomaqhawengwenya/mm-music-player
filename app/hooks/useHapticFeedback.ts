import { useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Cross-platform haptic feedback hook with web fallbacks.
 */
export function useHapticFeedback() {
  const isAvailable = Platform.OS !== 'web';

  const light = useCallback(() => {
    if (isAvailable) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
  }, [isAvailable]);

  const medium = useCallback(() => {
    if (isAvailable) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }
  }, [isAvailable]);

  const heavy = useCallback(() => {
    if (isAvailable) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}
    }
  }, [isAvailable]);

  const selection = useCallback(() => {
    if (isAvailable) {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
  }, [isAvailable]);

  const success = useCallback(() => {
    if (isAvailable) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
  }, [isAvailable]);

  const warning = useCallback(() => {
    if (isAvailable) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
    }
  }, [isAvailable]);

  const error = useCallback(() => {
    if (isAvailable) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
    }
  }, [isAvailable]);

  return {
    light,
    medium,
    heavy,
    selection,
    success,
    warning,
    error,
  };
}
