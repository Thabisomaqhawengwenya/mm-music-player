import { useRef, useEffect, useCallback } from 'react';
import { Animated, Easing } from 'react-native';

export interface UseSpinAnimationOptions {
  /** Duration in milliseconds for one full 360-degree rotation (default: 4000ms) */
  duration?: number;
  /** Whether spinning is currently active */
  active?: boolean;
}

/**
 * Custom hook providing smooth continuous rotation animation (e.g. for vinyl records or turntable deck).
 */
export function useSpinAnimation(options: UseSpinAnimationOptions = {}) {
  const { duration = 4000, active = false } = options;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const currentLoop = useRef<Animated.CompositeAnimation | null>(null);

  const startSpin = useCallback(() => {
    currentLoop.current?.stop();
    currentLoop.current = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    currentLoop.current.start();
  }, [duration, rotateAnim]);

  const stopSpin = useCallback(() => {
    currentLoop.current?.stop();
  }, []);

  const resetSpin = useCallback(() => {
    currentLoop.current?.stop();
    rotateAnim.setValue(0);
  }, [rotateAnim]);

  useEffect(() => {
    if (active) {
      startSpin();
    } else {
      stopSpin();
    }
    return () => {
      currentLoop.current?.stop();
    };
  }, [active, startSpin, stopSpin]);

  const spinInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return {
    rotateAnim,
    spinInterpolate,
    startSpin,
    stopSpin,
    resetSpin,
    animatedStyle: {
      transform: [{ rotate: spinInterpolate }],
    },
  };
}
