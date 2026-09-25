import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme, PetAvatarType, PlaybackState } from '../types';
import { PetBehaviorEngine } from './PetBehaviorEngine';
import { PetEngineState, PET_PROFILES } from './types';

interface MusicPetProps {
  playbackState: PlaybackState;
  theme: AppTheme;
  avatar?: PetAvatarType;
  size?: 'compact' | 'normal' | 'large';
  onPress?: () => void;
  showSpeech?: boolean;
}

export const MusicPet: React.FC<MusicPetProps> = ({
  playbackState,
  theme,
  avatar = 'cat',
  size = 'normal',
  onPress,
  showSpeech = true,
}) => {
  const [engineState, setEngineState] = useState<PetEngineState>({
    state: 'idle',
    action: 'none',
    speechText: null,
    moodEmoji: '🎧',
    isSleeping: false,
  });

  const engineRef = useRef<PetBehaviorEngine | null>(null);

  // Animation values
  const bobAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;
  const earAnim = useRef(new Animated.Value(0)).current;
  const eyeBlinkAnim = useRef(new Animated.Value(1)).current;
  const scaleTapAnim = useRef(new Animated.Value(1)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;

  // Active looping animation controllers
  const activeAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Initialize behavior engine
  useEffect(() => {
    const engine = new PetBehaviorEngine((newState) => {
      setEngineState(newState);
    });
    engineRef.current = engine;

    return () => {
      engine.cleanup();
    };
  }, []);

  // Update engine when playback state changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updatePlayerState(playbackState);
    }
  }, [
    playbackState.isPlaying,
    playbackState.currentTrack?.id,
    playbackState.position,
    playbackState.duration,
  ]);

  // Handle Animations according to Pet State
  useEffect(() => {
    if (activeAnimationRef.current) {
      activeAnimationRef.current.stop();
      activeAnimationRef.current = null;
    }

    const { state, action } = engineState;

    if (state === 'high_energy') {
      // Rapid, bouncy dance with ear wiggles
      const danceLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(bobAnim, {
              toValue: -12,
              duration: 220,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(bobAnim, {
              toValue: 0,
              duration: 220,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(swayAnim, {
              toValue: 1,
              duration: 220,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(swayAnim, {
              toValue: -1,
              duration: 440,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(swayAnim, {
              toValue: 0,
              duration: 220,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(earAnim, {
              toValue: 1,
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.timing(earAnim, {
              toValue: -1,
              duration: 360,
              useNativeDriver: true,
            }),
            Animated.timing(earAnim, {
              toValue: 0,
              duration: 180,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      activeAnimationRef.current = danceLoop;
      danceLoop.start();
      startParticleFloat();
    } else if (state === 'slow_music') {
      // Gentle, mellow swaying with rhythm
      const slowLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(bobAnim, {
              toValue: -5,
              duration: 850,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(bobAnim, {
              toValue: 0,
              duration: 850,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(swayAnim, {
              toValue: 0.7,
              duration: 850,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(swayAnim, {
              toValue: -0.7,
              duration: 1700,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(swayAnim, {
              toValue: 0,
              duration: 850,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      activeAnimationRef.current = slowLoop;
      slowLoop.start();
      startParticleFloat();
    } else if (state === 'playing') {
      // Standard groove head nod
      const grooveLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(bobAnim, {
            toValue: -8,
            duration: 380,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bobAnim, {
            toValue: 0,
            duration: 380,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      activeAnimationRef.current = grooveLoop;
      grooveLoop.start();
      startParticleFloat();
    } else if (state === 'inactive') {
      // Deep sleeping, slow subtle breathing
      const sleepLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(bobAnim, {
            toValue: 2,
            duration: 1600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bobAnim, {
            toValue: -1,
            duration: 1600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      activeAnimationRef.current = sleepLoop;
      sleepLoop.start();
      startParticleFloat();
    } else {
      // Idle subtle breathing
      const idleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(bobAnim, {
            toValue: -3,
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bobAnim, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      activeAnimationRef.current = idleLoop;
      idleLoop.start();
    }

    // Trigger Autonomous single actions
    if (action === 'blink') {
      Animated.sequence([
        Animated.timing(eyeBlinkAnim, { toValue: 0.1, duration: 90, useNativeDriver: true }),
        Animated.timing(eyeBlinkAnim, { toValue: 1, duration: 110, useNativeDriver: true }),
      ]).start();
    } else if (action === 'wave' || action === 'stretch') {
      Animated.sequence([
        Animated.timing(swayAnim, { toValue: 1.2, duration: 300, useNativeDriver: true }),
        Animated.timing(swayAnim, { toValue: -1.2, duration: 600, useNativeDriver: true }),
        Animated.timing(swayAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }

    return () => {
      if (activeAnimationRef.current) {
        activeAnimationRef.current.stop();
      }
    };
  }, [engineState.state, engineState.action]);

  const startParticleFloat = () => {
    particleAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleTap = () => {
    // Tactile spring press animation
    Animated.sequence([
      Animated.timing(scaleTapAnim, {
        toValue: 0.82,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scaleTapAnim, {
        toValue: 1.12,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleTapAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    if (engineRef.current) {
      engineRef.current.handleUserTap();
    }
    if (onPress) onPress();
  };

  const profile = PET_PROFILES[avatar] || PET_PROFILES.cat;

  // Rotation interpolations
  const swayRotate = swayAnim.interpolate({
    inputRange: [-1.5, 0, 1.5],
    outputRange: ['-14deg', '0deg', '14deg'],
  });

  const earLeftRotate = earAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-18deg', '0deg', '14deg'],
  });

  const earRightRotate = earAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-14deg', '0deg', '18deg'],
  });

  // Particle transforms
  const particleY = particleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -32],
  });

  const particleOpacity = particleAnim.interpolate({
    inputRange: [0, 0.2, 0.7, 1],
    outputRange: [0, 0.9, 0.8, 0],
  });

  const baseDimension = size === 'compact' ? 52 : size === 'large' ? 96 : 74;
  const isSleeping = engineState.isSleeping;

  return (
    <View style={styles.outerContainer}>
      {/* Dynamic Speech Bubble */}
      {showSpeech && engineState.speechText && (
        <View style={[styles.speechBubble, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
          <Text style={[styles.speechText, { color: theme.textPrimary }]} numberOfLines={1}>
            {engineState.speechText}
          </Text>
          <View style={[styles.speechArrow, { borderTopColor: theme.surface }]} />
        </View>
      )}

      {/* Floating Notes / Hearts / Sleep particle */}
      <Animated.View
        style={[
          styles.particleBox,
          {
            opacity: particleOpacity,
            transform: [{ translateY: particleY }],
          },
        ]}
      >
        <Text style={[styles.particleText, { color: theme.accent }]}>
          {isSleeping ? 'Zzz...' : engineState.state === 'high_energy' ? '🔥 ♫' : '♪ ✦'}
        </Text>
      </Animated.View>

      {/* Main Touch-Interactive Character */}
      <TouchableOpacity activeOpacity={0.85} onPress={handleTap} style={styles.petTouch}>
        <Animated.View
          style={[
            styles.petContainer,
            {
              width: baseDimension,
              height: baseDimension,
              transform: [
                { translateY: bobAnim },
                { rotate: swayRotate },
                { scale: scaleTapAnim },
              ],
            },
          ]}
        >
          {/* EARS (Responsive to Pet Type) */}
          <View style={styles.earsRow}>
            {/* Left Ear */}
            <Animated.View
              style={[
                avatar === 'cat'
                  ? styles.catEarLeft
                  : avatar === 'bunny'
                  ? styles.bunnyEarLeft
                  : styles.foxEarLeft,
                {
                  backgroundColor: profile.accentColor,
                  transform: [{ rotate: earLeftRotate }],
                },
              ]}
            >
              <View style={[styles.earInner, { backgroundColor: '#FFAAA6' }]} />
            </Animated.View>

            {/* Right Ear */}
            <Animated.View
              style={[
                avatar === 'cat'
                  ? styles.catEarRight
                  : avatar === 'bunny'
                  ? styles.bunnyEarRight
                  : styles.foxEarRight,
                {
                  backgroundColor: profile.accentColor,
                  transform: [{ rotate: earRightRotate }],
                },
              ]}
            >
              <View style={[styles.earInner, { backgroundColor: '#FFAAA6' }]} />
            </Animated.View>
          </View>

          {/* HEADPHONES BAND */}
          <View
            style={[
              styles.headphoneBand,
              {
                borderColor: theme.accent,
                shadowColor: theme.accent,
              },
            ]}
          />

          {/* HEAD / FACE BODY */}
          <View
            style={[
              styles.headBody,
              {
                backgroundColor: theme.surface,
                borderColor: theme.surfaceBorder,
              },
            ]}
          >
            {/* Left & Right Headphone Earcups */}
            <View style={[styles.headphoneCupLeft, { backgroundColor: theme.accent }]} />
            <View style={[styles.headphoneCupRight, { backgroundColor: theme.accent }]} />

            {/* EYES */}
            <Animated.View
              style={[
                styles.eyesContainer,
                { transform: [{ scaleY: eyeBlinkAnim }] },
              ]}
            >
              {isSleeping ? (
                // Sleeping horizontal eyes
                <View style={styles.eyesRow}>
                  <View style={[styles.sleepingEye, { backgroundColor: theme.textSecondary }]} />
                  <View style={[styles.sleepingEye, { backgroundColor: theme.textSecondary }]} />
                </View>
              ) : engineState.state === 'high_energy' ? (
                // Jamming excited eyes > <
                <View style={styles.eyesRow}>
                  <Text style={[styles.expressionEyeText, { color: theme.accent }]}>&gt;</Text>
                  <Text style={[styles.expressionEyeText, { color: theme.accent }]}>&lt;</Text>
                </View>
              ) : engineState.state === 'slow_music' ? (
                // Happy curved eyes ^ ^
                <View style={styles.eyesRow}>
                  <Text style={[styles.expressionEyeText, { color: theme.textPrimary }]}>^</Text>
                  <Text style={[styles.expressionEyeText, { color: theme.textPrimary }]}>^</Text>
                </View>
              ) : (
                // Bright round open eyes
                <View style={styles.eyesRow}>
                  <View style={[styles.pupilEye, { backgroundColor: theme.textPrimary }]}>
                    <View style={styles.pupilGlint} />
                  </View>
                  <View style={[styles.pupilEye, { backgroundColor: theme.textPrimary }]}>
                    <View style={styles.pupilGlint} />
                  </View>
                </View>
              )}
            </Animated.View>

            {/* NOSE & BLUSH */}
            <View style={styles.snoutRow}>
              <View style={[styles.blushDot, { backgroundColor: `${profile.accentColor}50` }]} />
              <View style={[styles.noseDot, { backgroundColor: profile.accentColor }]} />
              <View style={[styles.blushDot, { backgroundColor: `${profile.accentColor}50` }]} />
            </View>

            {/* CHEST PULSE BADGE */}
            {playbackState.isPlaying && (
              <View style={[styles.chestBadge, { backgroundColor: `${theme.accent}30` }]}>
                <Ionicons name="musical-notes" size={9} color={theme.accent} />
              </View>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechBubble: {
    position: 'absolute',
    top: -36,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    maxWidth: 180,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  speechText: {
    fontSize: 10,
    fontWeight: '800',
  },
  speechArrow: {
    position: 'absolute',
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  particleBox: {
    position: 'absolute',
    top: -16,
    right: 4,
    zIndex: 10,
  },
  particleText: {
    fontSize: 13,
    fontWeight: '800',
  },
  petTouch: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  petContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  earsRow: {
    position: 'absolute',
    top: -2,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    zIndex: 2,
  },
  catEarLeft: {
    width: 18,
    height: 18,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catEarRight: {
    width: 18,
    height: 18,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bunnyEarLeft: {
    width: 12,
    height: 28,
    borderRadius: 8,
    top: -12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bunnyEarRight: {
    width: 12,
    height: 28,
    borderRadius: 8,
    top: -12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foxEarLeft: {
    width: 20,
    height: 22,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foxEarRight: {
    width: 20,
    height: 22,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earInner: {
    width: '55%',
    height: '55%',
    borderRadius: 4,
    opacity: 0.6,
  },
  headphoneBand: {
    position: 'absolute',
    top: 4,
    width: '78%',
    height: 26,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  headBody: {
    width: '88%',
    height: '80%',
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headphoneCupLeft: {
    position: 'absolute',
    left: 2,
    top: 14,
    width: 8,
    height: 20,
    borderRadius: 4,
    zIndex: 8,
  },
  headphoneCupRight: {
    position: 'absolute',
    right: 2,
    top: 14,
    width: 8,
    height: 20,
    borderRadius: 4,
    zIndex: 8,
  },
  eyesContainer: {
    width: '100%',
    marginTop: 4,
  },
  eyesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  pupilEye: {
    width: 10,
    height: 10,
    borderRadius: 5,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 1.5,
    paddingRight: 1.5,
  },
  pupilGlint: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  sleepingEye: {
    width: 10,
    height: 2,
    borderRadius: 1,
  },
  expressionEyeText: {
    fontSize: 14,
    fontWeight: '900',
  },
  snoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  noseDot: {
    width: 5,
    height: 4,
    borderRadius: 2,
  },
  blushDot: {
    width: 7,
    height: 4,
    borderRadius: 3,
  },
  chestBadge: {
    position: 'absolute',
    bottom: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
