import { useRef, useCallback } from 'react';
import { Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface UsePressAnimationOptions {
  /** Target scale when pressed down (default 0.97 as per Emil Kowalski micro-tactility) */
  scaleTo?: number;
  /** Spring tension for rebound (default 300) */
  tension?: number;
  /** Spring friction for damping (default 20) */
  friction?: number;
  /** Whether to trigger haptic feedback on press down (default true on iOS/Android) */
  enableHaptics?: boolean;
  /** Haptic feedback style (default Light) */
  hapticStyle?: Haptics.ImpactFeedbackStyle;
}

/**
 * Custom hook providing tactile spring scale press feedback and optional haptic click.
 */
export function usePressAnimation(options: UsePressAnimationOptions = {}) {
  const {
    scaleTo = 0.97,
    tension = 300,
    friction = 20,
    enableHaptics = true,
    hapticStyle = Haptics.ImpactFeedbackStyle.Light,
  } = options;

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    if (enableHaptics && Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(hapticStyle);
      } catch {
        // Safe fallback if haptics unavailable
      }
    }

    Animated.spring(scaleAnim, {
      toValue: scaleTo,
      tension,
      friction,
      useNativeDriver: true,
    }).start();
  }, [enableHaptics, hapticStyle, scaleAnim, scaleTo, tension, friction]);

  const onPressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension,
      friction,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, tension, friction]);

  return {
    scaleAnim,
    onPressIn,
    onPressOut,
    animatedStyle: {
      transform: [{ scale: scaleAnim }],
    },
  };
}
