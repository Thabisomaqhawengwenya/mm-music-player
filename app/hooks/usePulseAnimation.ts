import { useRef, useEffect, useCallback } from 'react';
import { Animated, Easing } from 'react-native';

export interface UsePulseAnimationOptions {
  /** Minimum scale boundary (default: 1.0) */
  minScale?: number;
  /** Maximum scale boundary (default: 1.08) */
  maxScale?: number;
  /** Half-cycle duration in milliseconds (default: 800ms) */
  duration?: number;
  /** Whether pulsing is currently active */
  active?: boolean;
}

/**
 * Custom hook providing a rhythmic breathing/pulsing animation for music tempo and glowing elements.
 */
export function usePulseAnimation(options: UsePulseAnimationOptions = {}) {
  const { minScale = 1.0, maxScale = 1.08, duration = 800, active = false } = options;
  const pulseAnim = useRef(new Animated.Value(minScale)).current;
  const currentLoop = useRef<Animated.CompositeAnimation | null>(null);

  const startPulse = useCallback(() => {
    currentLoop.current?.stop();
    currentLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: maxScale,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: minScale,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    currentLoop.current.start();
  }, [duration, maxScale, minScale, pulseAnim]);

  const stopPulse = useCallback(() => {
    currentLoop.current?.stop();
    Animated.spring(pulseAnim, {
      toValue: minScale,
      tension: 100,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [minScale, pulseAnim]);

  useEffect(() => {
    if (active) {
      startPulse();
    } else {
      stopPulse();
    }
    return () => {
      currentLoop.current?.stop();
    };
  }, [active, startPulse, stopPulse]);

  return {
    pulseAnim,
    startPulse,
    stopPulse,
    animatedStyle: {
      transform: [{ scale: pulseAnim }],
    },
  };
}
