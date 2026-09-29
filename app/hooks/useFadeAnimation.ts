import { useRef, useCallback } from 'react';
import { Animated, Easing } from 'react-native';

export interface UseFadeAnimationOptions {
  /** Initial visibility state (default: false) */
  initialVisible?: boolean;
  /** Spawn starting scale (default 0.96 as per Kowalski scale spawn rule) */
  scaleFrom?: number;
  /** Duration in milliseconds (default: 240ms) */
  duration?: number;
}

/**
 * Custom hook providing smooth fade and scale-spawn transitions following Emil Kowalski guidelines.
 */
export function useFadeAnimation(options: UseFadeAnimationOptions = {}) {
  const { initialVisible = false, scaleFrom = 0.96, duration = 240 } = options;

  const opacityAnim = useRef(new Animated.Value(initialVisible ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(initialVisible ? 1 : scaleFrom)).current;

  // Kowalski strong ease-out: cubic-bezier(0.23, 1, 0.32, 1)
  const strongEaseOut = Easing.bezier(0.23, 1, 0.32, 1);

  const fadeIn = useCallback((onComplete?: () => void) => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration,
        easing: strongEaseOut,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration,
        easing: strongEaseOut,
        useNativeDriver: true,
      }),
    ]).start(onComplete);
  }, [duration, opacityAnim, scaleAnim, strongEaseOut]);

  const fadeOut = useCallback((onComplete?: () => void) => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: Math.round(duration * 0.75), // Exit is slightly snappier
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: scaleFrom,
        duration: Math.round(duration * 0.75),
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(onComplete);
  }, [duration, opacityAnim, scaleAnim, scaleFrom]);

  return {
    opacityAnim,
    scaleAnim,
    fadeIn,
    fadeOut,
    animatedStyle: {
      opacity: opacityAnim,
      transform: [{ scale: scaleAnim }],
    },
  };
}
