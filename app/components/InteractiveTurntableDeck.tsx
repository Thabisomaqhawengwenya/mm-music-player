import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  PanResponder,
  Dimensions,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppTheme, Track } from '@/src/types';
import { TactileButton } from './TactileButton';
import { soundFxService } from '@/src/services/soundFxService';

interface InteractiveTurntableDeckProps {
  track: Track | null;
  isPlaying: boolean;
  theme: AppTheme;
  size: number;
  onNext: () => void;
  onPrevious: () => void;
  onScratchDelta?: (deltaSec: number) => void;
}

export const InteractiveTurntableDeck: React.FC<InteractiveTurntableDeckProps> = ({
  track,
  isPlaying,
  theme,
  size,
  onNext,
  onPrevious,
  onScratchDelta,
}) => {
  const [deckMode, setDeckMode] = useState<'coverflow' | 'turntable'>('turntable');
  const [isScratching, setIsScratching] = useState(false);

  // Turntable continuous spin animation
  const spinAnim = useRef(new Animated.Value(0)).current;
  const spinLoop = useRef<Animated.CompositeAnimation | null>(null);

  // 3D perspective swipe animation
  const swipeX = useRef(new Animated.Value(0)).current;

  // Manual scratch rotation value
  const scratchRotation = useRef(new Animated.Value(0)).current;
  const lastTouchAngle = useRef<number>(0);
  const accumulatedRotation = useRef<number>(0);
  const lastScratchSfxTime = useRef<number>(0);

  // Tonearm angle
  const tonearmAnim = useRef(new Animated.Value(isPlaying ? 24 : 0)).current;

  // Turntable spin loop handling
  useEffect(() => {
    if (isPlaying && !isScratching) {
      spinLoop.current = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinLoop.current.start();

      Animated.spring(tonearmAnim, {
        toValue: 24,
        useNativeDriver: true,
        bounciness: 4,
      }).start();
    } else {
      spinLoop.current?.stop();
      if (!isPlaying) {
        Animated.spring(tonearmAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
        }).start();
      }
    }
    return () => {
      spinLoop.current?.stop();
    };
  }, [isPlaying, isScratching]);

  // Turntable Scratch PanResponder
  const scratchPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => deckMode === 'turntable',
      onMoveShouldSetPanResponder: () => deckMode === 'turntable',
      onPanResponderGrant: (evt) => {
        setIsScratching(true);
        spinLoop.current?.stop();

        const { locationX, locationY } = evt.nativeEvent;
        const centerX = size / 2;
        const centerY = size / 2;
        lastTouchAngle.current = Math.atan2(locationY - centerY, locationX - centerX);

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const centerX = size / 2;
        const centerY = size / 2;
        const currentAngle = Math.atan2(locationY - centerY, locationX - centerX);

        let delta = currentAngle - lastTouchAngle.current;
        // Normalize wrap-around (-PI to PI)
        if (delta > Math.PI) delta -= 2 * Math.PI;
        if (delta < -Math.PI) delta += 2 * Math.PI;

        lastTouchAngle.current = currentAngle;
        accumulatedRotation.current += delta;
        scratchRotation.setValue(accumulatedRotation.current);

        // Haptic scratch feedback
        const now = Date.now();
        if (Math.abs(delta) > 0.08 && now - lastScratchSfxTime.current > 140) {
          lastScratchSfxTime.current = now;
          Haptics.selectionAsync().catch(() => {});
          soundFxService.playSoundEffect('scratch_chirp', 0.6).catch(() => {});
        }

        // Notify parent of scrub offset if provided
        if (onScratchDelta) {
          const deltaSec = (delta / (2 * Math.PI)) * 3;
          onScratchDelta(deltaSec);
        }
      },
      onPanResponderRelease: () => {
        setIsScratching(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      },
    })
  ).current;

  // Cover Flow 3D Swipe PanResponder
  const swipePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => deckMode === 'coverflow',
      onMoveShouldSetPanResponder: (_, gesture) =>
        deckMode === 'coverflow' && (Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) < 15),
      onPanResponderMove: Animated.event([null, { dx: swipeX }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 65) {
          // Swipe Right -> Previous track
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          Animated.timing(swipeX, { toValue: size, duration: 160, useNativeDriver: true }).start(() => {
            onPrevious();
            swipeX.setValue(0);
          });
        } else if (gesture.dx < -65) {
          // Swipe Left -> Next track
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          Animated.timing(swipeX, { toValue: -size, duration: 160, useNativeDriver: true }).start(() => {
            onNext();
            swipeX.setValue(0);
          });
        } else {
          // Spring return to center
          Animated.spring(swipeX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
            speed: 20,
          }).start();
        }
      },
    })
  ).current;

  const spinInterpolation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scratchInterpolation = scratchRotation.interpolate({
    inputRange: [-Math.PI * 2, Math.PI * 2],
    outputRange: ['-360deg', '360deg'],
  });

  const swipeRotateY = swipeX.interpolate({
    inputRange: [-size, 0, size],
    outputRange: ['-32deg', '0deg', '32deg'],
  });

  const swipeScale = swipeX.interpolate({
    inputRange: [-size, 0, size],
    outputRange: [0.9, 1, 0.9],
  });

  const tonearmRotate = tonearmAnim.interpolate({
    inputRange: [0, 30],
    outputRange: ['0deg', '30deg'],
  });

  return (
    <View style={[styles.deckRoot, { width: size }]}>
      {/* Mode Switcher Pill */}
      <View style={styles.modeSwitcherRow}>
        <TactileButton
          onPress={() => setDeckMode('turntable')}
          style={[
            styles.modePill,
            deckMode === 'turntable' && { backgroundColor: theme.accent },
          ]}
        >
          <Ionicons
            name="disc"
            size={12}
            color={deckMode === 'turntable' ? theme.background : theme.textSecondary}
          />
          <Text
            style={[
              styles.modePillText,
              { color: deckMode === 'turntable' ? theme.background : theme.textSecondary },
            ]}
          >
            VINYL DJ
          </Text>
        </TactileButton>

        <TactileButton
          onPress={() => setDeckMode('coverflow')}
          style={[
            styles.modePill,
            deckMode === 'coverflow' && { backgroundColor: theme.accent },
          ]}
        >
          <Ionicons
            name="albums"
            size={12}
            color={deckMode === 'coverflow' ? theme.background : theme.textSecondary}
          />
          <Text
            style={[
              styles.modePillText,
              { color: deckMode === 'coverflow' ? theme.background : theme.textSecondary },
            ]}
          >
            COVER FLOW
          </Text>
        </TactileButton>
      </View>

      {/* Main Deck Container */}
      {deckMode === 'turntable' ? (
        /* VINYL DJ TURNTABLE MODE */
        <View style={styles.turntableStage} {...scratchPanResponder.panHandlers}>
          {/* Turntable Platter Base */}
          <View
            style={[
              styles.platterBase,
              {
                width: size - 16,
                height: size - 16,
                backgroundColor: '#12141A',
                borderColor: theme.surfaceBorder,
              },
            ]}
          >
            {/* Spinning Vinyl Record Disc */}
            <Animated.View
              style={[
                styles.vinylDisc,
                {
                  width: size - 32,
                  height: size - 32,
                  transform: [
                    { rotate: isScratching ? scratchInterpolation : spinInterpolation },
                  ],
                },
              ]}
            >
              {/* Concentric Audio Grooves */}
              <View style={styles.grooveRing1} />
              <View style={styles.grooveRing2} />
              <View style={styles.grooveRing3} />
              <View style={styles.grooveRing4} />

              {/* Center Label Art */}
              <View style={[styles.centerLabel, { borderColor: theme.accent }]}>
                {track?.artwork ? (
                  <Image source={{ uri: track.artwork }} style={styles.centerLabelImage} />
                ) : (
                  <View style={[styles.centerLabelPlaceholder, { backgroundColor: theme.surface }]}>
                    <Ionicons name="musical-notes" size={24} color={theme.accent} />
                  </View>
                )}
                {/* Center Spindle Hole */}
                <View style={styles.spindleHole} />
              </View>
            </Animated.View>

            {/* Tonearm & Needle */}
            <View style={styles.tonearmBase}>
              <Animated.View
                style={[
                  styles.tonearmArm,
                  {
                    transform: [{ rotate: tonearmRotate }],
                  },
                ]}
              >
                <View style={[styles.tonearmHead, { backgroundColor: theme.accent }]} />
              </Animated.View>
            </View>

            {/* Scratching Status Pill */}
            {isScratching && (
              <View style={[styles.scratchBadge, { backgroundColor: theme.accent }]}>
                <Ionicons name="radio" size={12} color={theme.background} />
                <Text style={[styles.scratchBadgeText, { color: theme.background }]}>
                  DJ SCRATCHING
                </Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        /* COVER FLOW 3D PERSPECTIVE SWIPE MODE */
        <View style={styles.coverflowStage} {...swipePanResponder.panHandlers}>
          <Animated.View
            style={[
              styles.artworkCard,
              {
                width: size - 24,
                height: size - 24,
                borderColor: theme.surfaceBorder,
                shadowColor: theme.accent,
                transform: [
                  { translateX: swipeX },
                  { rotateY: swipeRotateY },
                  { scale: swipeScale },
                ],
              },
            ]}
          >
            {track?.artwork ? (
              <Image source={{ uri: track.artwork }} style={styles.artworkImage} />
            ) : (
              <View style={[styles.artworkPlaceholder, { backgroundColor: theme.surface }]}>
                <Ionicons name="disc" size={96} color={theme.accent} />
                <Text style={[styles.audioPill, { color: theme.accent, borderColor: theme.accent }]}>
                  HI-RES AUDIO
                </Text>
              </View>
            )}

            {/* Swipe instruction hint */}
            <View style={styles.swipeHintBar}>
              <Ionicons name="chevron-back" size={14} color={theme.textTertiary} />
              <Text style={[styles.swipeHintText, { color: theme.textTertiary }]}>
                Swipe card to skip tracks
              </Text>
              <Ionicons name="chevron-forward" size={14} color={theme.textTertiary} />
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  deckRoot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeSwitcherRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    zIndex: 10,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  modePillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  turntableStage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  platterBase: {
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  vinylDisc: {
    borderRadius: 999,
    backgroundColor: '#0A0A0C',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  grooveRing1: {
    position: 'absolute',
    width: '88%',
    height: '88%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  grooveRing2: {
    position: 'absolute',
    width: '74%',
    height: '74%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  grooveRing3: {
    position: 'absolute',
    width: '60%',
    height: '60%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  grooveRing4: {
    position: 'absolute',
    width: '46%',
    height: '46%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  centerLabel: {
    width: '36%',
    height: '36%',
    borderRadius: 999,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabelImage: {
    width: '100%',
    height: '100%',
  },
  centerLabelPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spindleHole: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#000',
    borderWidth: 1.5,
    borderColor: '#777',
  },
  tonearmBase: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#666',
    zIndex: 5,
  },
  tonearmArm: {
    position: 'absolute',
    top: 12,
    left: 10,
    width: 4,
    height: 90,
    backgroundColor: '#888',
    borderRadius: 2,
    transformOrigin: 'top center',
  },
  tonearmHead: {
    position: 'absolute',
    bottom: -6,
    left: -4,
    width: 12,
    height: 14,
    borderRadius: 3,
  },
  scratchBadge: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 15,
  },
  scratchBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  coverflowStage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  artworkPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  audioPill: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  swipeHintBar: {
    position: 'absolute',
    bottom: 8,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 3,
    borderRadius: 8,
  },
  swipeHintText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
