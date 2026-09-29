import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppTheme, Track } from '@/src/types';
import { formatTime } from '@/src/utils/formatters';

interface WaveformScrubberProps {
  track: Track | null;
  position: number;
  duration: number;
  theme: AppTheme;
  onSeek: (seconds: number) => void;
}

const BAR_COUNT = 44;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const WaveformScrubber: React.FC<WaveformScrubberProps> = ({
  track,
  position,
  duration,
  theme,
  onSeek,
}) => {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubSeconds, setScrubSeconds] = useState(position);
  const lastHapticBarIndex = useRef<number>(-1);
  const containerWidthRef = useRef<number>(SCREEN_WIDTH - 48);

  const bubbleScaleAnim = useRef(new Animated.Value(0)).current;

  // Generate a deterministic unique waveform silhouette for this specific track
  const waveformHeights = useMemo(() => {
    const seed = (track?.id || 'default').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const heights: number[] = [];

    for (let i = 0; i < BAR_COUNT; i++) {
      // Harmonic wave superposition + pseudo-random noise
      const x = i / BAR_COUNT;
      const sin1 = Math.sin(x * Math.PI * 3.5 + seed);
      const sin2 = Math.cos(x * Math.PI * 7.2 + seed * 0.5);
      const sin3 = Math.sin(x * Math.PI * 1.2);
      const noise = ((Math.sin(i * 99 + seed) * 10000) % 1 + 1) / 2;

      // Ensure middle bars have healthy fullness, tapering naturally at edges
      const baseHeight = 0.28 + 0.52 * Math.abs(sin1 * 0.45 + sin2 * 0.35 + sin3 * 0.2) + noise * 0.2;
      const clamped = Math.max(0.18, Math.min(1.0, baseHeight));
      heights.push(clamped);
    }
    return heights;
  }, [track?.id]);

  const currentSec = isScrubbing ? scrubSeconds : position;
  const safeDuration = duration > 0 ? duration : 1;
  const progressRatio = Math.max(0, Math.min(1, currentSec / safeDuration));
  const activeBarIndex = Math.floor(progressRatio * BAR_COUNT);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsScrubbing(true);
        Animated.spring(bubbleScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 25,
          bounciness: 8,
        }).start();

        const x = Math.max(0, Math.min(containerWidthRef.current, evt.nativeEvent.locationX));
        const ratio = x / containerWidthRef.current;
        const targetSec = ratio * (duration || 1);
        setScrubSeconds(targetSec);

        const barIdx = Math.floor(ratio * BAR_COUNT);
        if (barIdx !== lastHapticBarIndex.current) {
          lastHapticBarIndex.current = barIdx;
          Haptics.selectionAsync().catch(() => {});
        }
      },
      onPanResponderMove: (evt) => {
        const x = Math.max(0, Math.min(containerWidthRef.current, evt.nativeEvent.locationX));
        const ratio = x / containerWidthRef.current;
        const targetSec = ratio * (duration || 1);
        setScrubSeconds(targetSec);

        const barIdx = Math.floor(ratio * BAR_COUNT);
        if (barIdx !== lastHapticBarIndex.current) {
          lastHapticBarIndex.current = barIdx;
          Haptics.selectionAsync().catch(() => {});
        }
      },
      onPanResponderRelease: () => {
        setIsScrubbing(false);
        Animated.timing(bubbleScaleAnim, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }).start();

        onSeek(scrubSeconds);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      },
      onPanResponderTerminate: () => {
        setIsScrubbing(false);
        Animated.timing(bubbleScaleAnim, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.wrapper}>
      {/* Time Indicator Bubble during scrub */}
      <Animated.View
        style={[
          styles.scrubBubble,
          {
            left: `${progressRatio * 100}%`,
            backgroundColor: theme.accent,
            transform: [{ scale: bubbleScaleAnim }, { translateX: -28 }],
          },
        ]}
      >
        <Text style={[styles.scrubBubbleText, { color: theme.background }]}>
          {formatTime(currentSec)}
        </Text>
      </Animated.View>

      {/* Main Touch Waveform Stage */}
      <View
        style={[styles.container, { borderColor: theme.surfaceBorder }]}
        onLayout={(e) => {
          containerWidthRef.current = e.nativeEvent.layout.width;
        }}
        {...panResponder.panHandlers}
      >
        {waveformHeights.map((hRatio, index) => {
          const isPassed = index <= activeBarIndex;
          const barHeight = 6 + hRatio * 32;

          return (
            <View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height: barHeight,
                  backgroundColor: isPassed ? theme.accent : `${theme.textTertiary}50`,
                  borderRadius: 2,
                  shadowColor: isPassed ? theme.accent : 'transparent',
                  shadowOpacity: isPassed ? 0.35 : 0,
                  shadowRadius: 3,
                },
              ]}
            />
          );
        })}

        {/* Interactive Playhead Needle */}
        <View
          style={[
            styles.playheadNeedle,
            {
              left: `${progressRatio * 100}%`,
              backgroundColor: theme.textPrimary,
              borderColor: theme.accent,
            },
          ]}
        />
      </View>

      {/* Time labels row */}
      <View style={styles.timeRow}>
        <Text style={[styles.timeText, { color: theme.textSecondary }]}>
          {formatTime(currentSec)}
        </Text>
        <Text style={[styles.timeText, { color: theme.textTertiary }]}>
          {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingVertical: 6,
    position: 'relative',
  },
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    position: 'relative',
  },
  waveformBar: {
    flex: 1,
    marginHorizontal: 1.2,
  },
  playheadNeedle: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    width: 3,
    borderRadius: 2,
    borderWidth: 0.5,
    marginLeft: -1.5,
  },
  scrubBubble: {
    position: 'absolute',
    top: -28,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  scrubBubbleText: {
    fontSize: 11,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
