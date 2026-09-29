import { useRef, useCallback } from 'react';
import { Animated, Easing } from 'react-native';

export interface UseSlideAnimationOptions {
  /** Initial offset value (e.g. 300 for bottom sheet offscreen) */
  initialOffset?: number;
  /** Duration in milliseconds (default: 300ms) */
  duration?: number;
  /** Direction: 'translateY' | 'translateX' (default: 'translateY') */
  axis?: 'translateY' | 'translateX';
}

/**
 * Custom hook providing sheet/drawer slide animations with high-damping curves.
 */
export function useSlideAnimation(options: UseSlideAnimationOptions = {}) {
  const { initialOffset = 300, duration = 300, axis = 'translateY' } = options;

  const slideAnim = useRef(new Animated.Value(initialOffset)).current;
  // High-damping sheet curve: cubic-bezier(0.32, 0.72, 0, 1)
  const sheetEasing = Easing.bezier(0.32, 0.72, 0, 1);

  const slideIn = useCallback((onComplete?: () => void) => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      easing: sheetEasing,
      useNativeDriver: true,
    }).start(onComplete);
  }, [duration, sheetEasing, slideAnim]);

  const slideOut = useCallback((toOffset = initialOffset, onComplete?: () => void) => {
    Animated.timing(slideAnim, {
      toValue: toOffset,
      duration: Math.round(duration * 0.8),
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(onComplete);
  }, [duration, initialOffset, slideAnim]);

  return {
    slideAnim,
    slideIn,
    slideOut,
    animatedStyle: {
      transform: [
        axis === 'translateY' ? { translateY: slideAnim } : { translateX: slideAnim },
      ],
    },
  };
}
