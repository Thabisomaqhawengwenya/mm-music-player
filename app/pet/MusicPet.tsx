import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Easing,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme, PetAvatarType, PetAccessory, PetTreat, PlaybackState } from '../../src/types';
import { PetBehaviorEngine } from './PetBehaviorEngine';
import {
  PetEngineState,
  PET_PROFILES,
  MascotEmotion,
} from './types';
import * as Haptics from 'expo-haptics';

interface MusicPetProps {
  playbackState: PlaybackState;
  theme: AppTheme;
  avatar?: PetAvatarType;
  accessory?: PetAccessory;
  affection?: number;
  size?: 'compact' | 'normal' | 'large';
  motionEnabled?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  showTreatControls?: boolean;
  showEmoteControls?: boolean;
  onFeed?: (treat: PetTreat) => void;
  onSelectEmote?: (emote: string) => void;
  emotionOverride?: MascotEmotion | null;
}

export const EMOTE_OPTIONS = [
  { id: 'heart', emote: '❤️', label: 'Love' },
  { id: 'music', emote: '🎵', label: 'Jam' },
  { id: 'sparkle', emote: '✨', label: 'Vibe' },
  { id: 'hype', emote: '⚡', label: 'Hype' },
  { id: 'headphones', emote: '🎧', label: 'Listen' },
  { id: 'sleep', emote: '💤', label: 'Relax' },
  { id: 'sweat', emote: '💧', label: 'Whoops' },
  { id: 'exclamation', emote: '❗', label: 'Surprise' },
];

export const MusicPet: React.FC<MusicPetProps> = ({
  playbackState,
  theme,
  avatar = 'human_aria',
  accessory = 'none',
  affection = 50,
  size = 'normal',
  motionEnabled = true,
  onPress,
  onLongPress,
  showTreatControls = false,
  showEmoteControls = false,
  onFeed,
  onSelectEmote,
  emotionOverride,
}) => {
  const [engineState, setEngineState] = useState<PetEngineState>({
    state: 'idle',
    action: 'none',
    emotion: 'happy',
    emoteIcon: null,
    isSleeping: false,
  });

  const engineRef = useRef<PetBehaviorEngine | null>(null);

  // Animation values
  const bobAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;
  const headphoneGlowAnim = useRef(new Animated.Value(0.4)).current;
  const eyeBlinkAnim = useRef(new Animated.Value(1)).current;
  const scaleTapAnim = useRef(new Animated.Value(1)).current;
  const emoteFloatAnim = useRef(new Animated.Value(0)).current;
  const emoteOpacityAnim = useRef(new Animated.Value(0)).current;

  const activeLoopRef = useRef<Animated.CompositeAnimation | null>(null);

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

  // Update engine on playback changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updatePlayerState(playbackState);
    }
  }, [
    playbackState.isPlaying,
    playbackState.currentTrack?.id,
    playbackState.position,
    playbackState.duration,
    playbackState.volume,
  ]);

  const effectiveEmotion: MascotEmotion =
    emotionOverride || engineState.emotion || (playbackState.isPlaying ? 'dancing' : 'relaxed');

  // Trigger emote float animation when emoteIcon appears
  useEffect(() => {
    if (engineState.emoteIcon && motionEnabled) {
      emoteFloatAnim.setValue(0);
      emoteOpacityAnim.setValue(0);

      Animated.sequence([
        Animated.parallel([
          Animated.timing(emoteFloatAnim, {
            toValue: -24,
            duration: 400,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(emoteOpacityAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1200),
        Animated.parallel([
          Animated.timing(emoteFloatAnim, {
            toValue: -36,
            duration: 450,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(emoteOpacityAnim, {
            toValue: 0,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [engineState.emoteIcon, motionEnabled]);

  // Main natural physics loops depending on emotion & state
  useEffect(() => {
    if (activeLoopRef.current) {
      activeLoopRef.current.stop();
      activeLoopRef.current = null;
    }

    if (!motionEnabled) {
      bobAnim.setValue(0);
      swayAnim.setValue(0);
      headphoneGlowAnim.setValue(0.7);
      return;
    }

    if (effectiveEmotion === 'dancing') {
      // Natural rhythmic head bounce & headphone pulse
      const danceLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(bobAnim, {
              toValue: -6,
              duration: 280,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(bobAnim, {
              toValue: 0,
              duration: 280,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(swayAnim, {
              toValue: 1,
              duration: 280,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(swayAnim, {
              toValue: -1,
              duration: 560,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(swayAnim, {
              toValue: 0,
              duration: 280,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(headphoneGlowAnim, {
              toValue: 1,
              duration: 280,
              useNativeDriver: true,
            }),
            Animated.timing(headphoneGlowAnim, {
              toValue: 0.4,
              duration: 280,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      activeLoopRef.current = danceLoop;
      danceLoop.start();
    } else if (effectiveEmotion === 'excited') {
      // Energetic joyful bounce
      const excitedLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(bobAnim, {
            toValue: -8,
            duration: 220,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(bobAnim, {
            toValue: 0,
            duration: 220,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      activeLoopRef.current = excitedLoop;
      excitedLoop.start();
    } else if (effectiveEmotion === 'sleepy') {
      // Gentle, slow breathing oscillation
      const sleepLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(bobAnim, {
            toValue: 2,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bobAnim, {
            toValue: -1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      activeLoopRef.current = sleepLoop;
      sleepLoop.start();
    } else if (effectiveEmotion === 'sad') {
      // Low posture slump
      Animated.timing(bobAnim, {
        toValue: 3,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      // Subtle natural breathing
      const idleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(bobAnim, {
            toValue: -2.5,
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
      activeLoopRef.current = idleLoop;
      idleLoop.start();
    }

    // Micro-blink action
    if (engineState.action === 'blink' && effectiveEmotion !== 'sleepy') {
      Animated.sequence([
        Animated.timing(eyeBlinkAnim, { toValue: 0.1, duration: 80, useNativeDriver: true }),
        Animated.timing(eyeBlinkAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }

    return () => {
      if (activeLoopRef.current) activeLoopRef.current.stop();
    };
  }, [effectiveEmotion, engineState.action, motionEnabled]);

  const handleTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });

    Animated.sequence([
      Animated.timing(scaleTapAnim, {
        toValue: 0.88,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleTapAnim, {
        toValue: 1.1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.spring(scaleTapAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    if (engineRef.current) {
      engineRef.current.handleUserTap();
    }
    if (onPress) onPress();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
    if (engineRef.current) {
      engineRef.current.triggerEmoteReaction('excited', '❤️');
    }
    if (onLongPress) onLongPress();
  };

  const handleFeed = (treat: PetTreat) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });

    Animated.sequence([
      Animated.timing(scaleTapAnim, { toValue: 1.18, duration: 110, useNativeDriver: true }),
      Animated.spring(scaleTapAnim, { toValue: 1.0, friction: 3, useNativeDriver: true }),
    ]).start();

    if (engineRef.current) {
      engineRef.current.triggerEmoteReaction('happy', '✨');
    }
    if (onFeed) onFeed(treat);
  };

  const profile = PET_PROFILES[avatar] || PET_PROFILES.human_aria;
  const isHuman = avatar.startsWith('human_') || !['cat', 'bunny', 'kaomoji'].includes(avatar);

  const skinColor = profile.skinColor || '#FFDFBA';
  const hairColor = profile.hairColor || '#4A3728';
  const headphoneAccent =
    accessory === 'gold_headphones' ? '#FFD700' : profile.accentColor || theme.accent;

  const baseDimension = size === 'compact' ? 52 : size === 'large' ? 96 : 74;

  const swayRotate = swayAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-6deg', '0deg', '6deg'],
  });

  // Render 2D Human Expressive Facial Features
  const renderHumanFace = () => {
    const isSleeping = effectiveEmotion === 'sleepy' || engineState.isSleeping;

    return (
      <View style={styles.humanFaceContent}>
        {/* Eyebrows */}
        <View style={styles.eyebrowRow}>
          <View
            style={[
              styles.eyebrow,
              { backgroundColor: hairColor },
              effectiveEmotion === 'sad' && styles.eyebrowSadLeft,
              effectiveEmotion === 'focused' && styles.eyebrowFocusedLeft,
              effectiveEmotion === 'surprised' && styles.eyebrowRaised,
            ]}
          />
          <View
            style={[
              styles.eyebrow,
              { backgroundColor: hairColor },
              effectiveEmotion === 'sad' && styles.eyebrowSadRight,
              effectiveEmotion === 'focused' && styles.eyebrowFocusedRight,
              effectiveEmotion === 'surprised' && styles.eyebrowRaised,
            ]}
          />
        </View>

        {/* Eyes Row */}
        <Animated.View
          style={[
            styles.eyesRow,
            { transform: [{ scaleY: eyeBlinkAnim }] },
          ]}
        >
          {isSleeping ? (
            // Sleeping eyes
            <>
              <View style={[styles.closedEyeLine, { backgroundColor: '#2C1810' }]} />
              <View style={[styles.closedEyeLine, { backgroundColor: '#2C1810' }]} />
            </>
          ) : effectiveEmotion === 'dancing' ? (
            // Joyful smiling eyes (^ ^)
            <>
              <View style={styles.joyfulEyeArc}>
                <View style={[styles.eyeArcLine, { borderColor: '#1F140E' }]} />
              </View>
              <View style={styles.joyfulEyeArc}>
                <View style={[styles.eyeArcLine, { borderColor: '#1F140E' }]} />
              </View>
            </>
          ) : effectiveEmotion === 'sad' ? (
            // Drooping sorrowful eyes with tear sheen
            <>
              <View style={[styles.sadEye, { backgroundColor: '#2C1810' }]}>
                <View style={styles.sadTearDrop} />
              </View>
              <View style={[styles.sadEye, { backgroundColor: '#2C1810' }]}>
                <View style={styles.sadTearDrop} />
              </View>
            </>
          ) : effectiveEmotion === 'surprised' ? (
            // Wide open round anime eyes
            <>
              <View style={[styles.surprisedEye, { borderColor: '#1F140E' }]}>
                <View style={[styles.eyePupil, { backgroundColor: '#1F140E', width: 5, height: 5 }]} />
              </View>
              <View style={[styles.surprisedEye, { borderColor: '#1F140E' }]}>
                <View style={[styles.eyePupil, { backgroundColor: '#1F140E', width: 5, height: 5 }]} />
              </View>
            </>
          ) : (
            // Warm expressive anime eyes with sparkle catchlights
            <>
              <View style={[styles.humanEye, { backgroundColor: '#1E1B18' }]}>
                <View style={styles.eyeHighlightBig} />
                <View style={styles.eyeHighlightSmall} />
              </View>
              <View style={[styles.humanEye, { backgroundColor: '#1E1B18' }]}>
                <View style={styles.eyeHighlightBig} />
                <View style={styles.eyeHighlightSmall} />
              </View>
            </>
          )}

          {/* Sunglasses Accessory */}
          {accessory === 'sunglasses' && !isSleeping && (
            <View style={styles.sunglassesFrame}>
              <View style={[styles.sunglassLens, { borderColor: theme.accent }]} />
              <View style={[styles.sunglassBridge, { backgroundColor: theme.accent }]} />
              <View style={[styles.sunglassLens, { borderColor: theme.accent }]} />
            </View>
          )}
        </Animated.View>

        {/* Blush Cheeks */}
        <View style={styles.blushRow}>
          <View
            style={[
              styles.blushOval,
              {
                opacity:
                  effectiveEmotion === 'happy' || effectiveEmotion === 'excited' ? 0.75 : 0.35,
              },
            ]}
          />
          <View
            style={[
              styles.blushOval,
              {
                opacity:
                  effectiveEmotion === 'happy' || effectiveEmotion === 'excited' ? 0.75 : 0.35,
              },
            ]}
          />
        </View>

        {/* Expressive Mouth */}
        <View style={styles.mouthContainer}>
          {effectiveEmotion === 'excited' || effectiveEmotion === 'dancing' ? (
            // Joyful open smile
            <View style={styles.openSmileMouth}>
              <View style={styles.smileTongue} />
            </View>
          ) : effectiveEmotion === 'sad' ? (
            // Soft downturned pout line
            <View style={styles.sadMouth} />
          ) : effectiveEmotion === 'surprised' ? (
            // Small round 'o'
            <View style={styles.surprisedMouth} />
          ) : effectiveEmotion === 'sleepy' ? (
            // Peaceful relaxed line
            <View style={styles.sleepingMouth} />
          ) : (
            // Sweet gentle smile
            <View style={styles.gentleSmileMouth} />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.outerContainer}>
      {/* Pure Visual Floating Emote Badge (NO TEXT DIALOGUE) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.emoteBubble,
          {
            opacity: emoteOpacityAnim,
            transform: [{ translateY: emoteFloatAnim }],
            backgroundColor: theme.surface,
            borderColor: theme.surfaceBorder,
          },
        ]}
      >
        <Text style={styles.emoteIconText}>{engineState.emoteIcon || '🎵'}</Text>
      </Animated.View>

      {/* Main Touch-Interactive 2D Mascot */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handleTap}
        onLongPress={handleLongPress}
        delayLongPress={300}
        style={styles.petTouch}
      >
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
          {/* ACCESSORY: ROYAL CROWN */}
          {accessory === 'crown' && (
            <View style={styles.crownAccessory}>
              <Text style={{ fontSize: size === 'large' ? 22 : 16 }}>👑</Text>
            </View>
          )}

          {/* BACK HAIR SILHOUETTE */}
          {isHuman && (
            <View style={[styles.backHair, { backgroundColor: hairColor }]} />
          )}

          {/* OVER-EAR STUDIO HEADPHONES ARCH */}
          <View
            style={[
              styles.headphoneArch,
              {
                borderColor: headphoneAccent,
                shadowColor: headphoneAccent,
              },
            ]}
          />

          {/* HEAD & FACE SURFACE */}
          <View
            style={[
              styles.headBody,
              {
                backgroundColor: isHuman ? skinColor : theme.surface,
                borderColor: isHuman ? 'rgba(0,0,0,0.08)' : theme.surfaceBorder,
              },
            ]}
          >
            {/* FRONT HAIR BANGS */}
            {isHuman && (
              <View style={styles.frontHairContainer} pointerEvents="none">
                <View style={[styles.bangLeft, { backgroundColor: hairColor }]} />
                <View style={[styles.bangCenter, { backgroundColor: hairColor }]} />
                <View style={[styles.bangRight, { backgroundColor: hairColor }]} />
                {/* Subtle hair shine */}
                <View style={styles.hairSheen} />
              </View>
            )}

            {/* Left & Right Studio Headphone Earcups with LED Glow */}
            <Animated.View
              style={[
                styles.headphoneEarcupLeft,
                {
                  backgroundColor: headphoneAccent,
                  opacity: headphoneGlowAnim,
                },
              ]}
            >
              <View style={styles.earcupInnerRim} />
            </Animated.View>

            <Animated.View
              style={[
                styles.headphoneEarcupRight,
                {
                  backgroundColor: headphoneAccent,
                  opacity: headphoneGlowAnim,
                },
              ]}
            >
              <View style={styles.earcupInnerRim} />
            </Animated.View>

            {/* 2D Expressive Face Content */}
            {renderHumanFace()}

            {/* ACCESSORY: MINI BOOMBOX BADGE */}
            {accessory === 'boombox' && (
              <View style={[styles.boomboxBadge, { backgroundColor: theme.accent }]}>
                <Ionicons name="radio" size={10} color={theme.background} />
              </View>
            )}
          </View>

          {/* COZY HOODIE / COLLAR NECKLINE */}
          {isHuman && (
            <View
              style={[
                styles.hoodieCollar,
                {
                  backgroundColor: theme.surfaceLight,
                  borderColor: theme.surfaceBorder,
                },
              ]}
            >
              <View style={[styles.collarZipper, { backgroundColor: headphoneAccent }]} />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Visual Emote Reactions Tray (Quick Tap Reaction) */}
      {showEmoteControls && (
        <View
          style={[
            styles.emoteTray,
            { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.emoteScrollContent}
          >
            {EMOTE_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
                  if (engineRef.current) {
                    const em =
                      item.id === 'heart'
                        ? 'excited'
                        : item.id === 'sleep'
                          ? 'sleepy'
                          : item.id === 'sweat'
                            ? 'sad'
                            : item.id === 'hype'
                              ? 'dancing'
                              : 'happy';
                    engineRef.current.triggerEmoteReaction(em, item.emote);
                  }
                  if (onSelectEmote) onSelectEmote(item.emote);
                }}
                style={[
                  styles.emotePillBtn,
                  { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder },
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.emotePillIcon}>{item.emote}</Text>
                <Text style={[styles.emotePillLabel, { color: theme.textSecondary }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Interactive Treat Feeding Tray */}
      {showTreatControls && (
        <View
          style={[
            styles.treatTray,
            { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
          ]}
        >
          <TouchableOpacity
            onPress={() => handleFeed('cookie')}
            style={styles.treatBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.treatEmoji}>🍪</Text>
            <Text style={[styles.treatLabel, { color: theme.textSecondary }]}>Cookie</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleFeed('donut')}
            style={styles.treatBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.treatEmoji}>🍩</Text>
            <Text style={[styles.treatLabel, { color: theme.textSecondary }]}>Donut</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleFeed('fish')}
            style={styles.treatBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.treatEmoji}>🐟</Text>
            <Text style={[styles.treatLabel, { color: theme.textSecondary }]}>Fish</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoteBubble: {
    position: 'absolute',
    top: -30,
    zIndex: 30,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emoteIconText: {
    fontSize: 18,
  },
  petTouch: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  petContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backHair: {
    position: 'absolute',
    top: 2,
    width: '92%',
    height: '84%',
    borderRadius: 30,
    zIndex: 1,
  },
  headphoneArch: {
    position: 'absolute',
    top: -2,
    width: '84%',
    height: '45%',
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    zIndex: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
  },
  headBody: {
    width: '82%',
    height: '76%',
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  frontHairContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    zIndex: 6,
  },
  bangLeft: {
    position: 'absolute',
    left: 4,
    top: 0,
    width: 16,
    height: 14,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 4,
  },
  bangCenter: {
    position: 'absolute',
    left: '32%',
    top: 0,
    width: 18,
    height: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  bangRight: {
    position: 'absolute',
    right: 4,
    top: 0,
    width: 16,
    height: 14,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 4,
  },
  hairSheen: {
    position: 'absolute',
    top: 2,
    left: '25%',
    width: '50%',
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  headphoneEarcupLeft: {
    position: 'absolute',
    left: 0,
    top: 14,
    width: 7,
    height: 22,
    borderRadius: 4,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headphoneEarcupRight: {
    position: 'absolute',
    right: 0,
    top: 14,
    width: 7,
    height: 22,
    borderRadius: 4,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earcupInnerRim: {
    width: 3,
    height: 12,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  humanFaceContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    zIndex: 5,
  },
  eyebrowRow: {
    flexDirection: 'row',
    width: '58%',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  eyebrow: {
    width: 9,
    height: 2,
    borderRadius: 1,
  },
  eyebrowSadLeft: {
    transform: [{ rotate: '18deg' }, { translateY: -1 }],
  },
  eyebrowSadRight: {
    transform: [{ rotate: '-18deg' }, { translateY: -1 }],
  },
  eyebrowFocusedLeft: {
    transform: [{ rotate: '-14deg' }, { translateY: 1 }],
  },
  eyebrowFocusedRight: {
    transform: [{ rotate: '14deg' }, { translateY: 1 }],
  },
  eyebrowRaised: {
    transform: [{ translateY: -2 }],
  },
  eyesRow: {
    flexDirection: 'row',
    width: '64%',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 14,
  },
  humanEye: {
    width: 10,
    height: 11,
    borderRadius: 5,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 1.5,
  },
  eyeHighlightBig: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  eyeHighlightSmall: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  closedEyeLine: {
    width: 10,
    height: 2,
    borderRadius: 1,
  },
  joyfulEyeArc: {
    width: 10,
    height: 6,
    overflow: 'hidden',
    alignItems: 'center',
  },
  eyeArcLine: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderTopWidth: 2.5,
  },
  sadEye: {
    width: 10,
    height: 9,
    borderRadius: 4.5,
    position: 'relative',
  },
  sadTearDrop: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#60A5FA',
  },
  surprisedEye: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  eyePupil: {
    borderRadius: 3,
  },
  blushRow: {
    flexDirection: 'row',
    width: '74%',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  blushOval: {
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF6584',
  },
  mouthContainer: {
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  gentleSmileMouth: {
    width: 8,
    height: 4,
    borderBottomWidth: 1.8,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderColor: '#78350F',
  },
  openSmileMouth: {
    width: 10,
    height: 6,
    backgroundColor: '#DC2626',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  smileTongue: {
    width: 7,
    height: 3,
    backgroundColor: '#F87171',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  sadMouth: {
    width: 7,
    height: 3,
    borderTopWidth: 1.8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderColor: '#78350F',
  },
  surprisedMouth: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#78350F',
  },
  sleepingMouth: {
    width: 4,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: '#78350F',
  },
  hoodieCollar: {
    position: 'absolute',
    bottom: -6,
    width: '60%',
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    zIndex: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collarZipper: {
    width: 3,
    height: 7,
    borderRadius: 1.5,
  },
  crownAccessory: {
    position: 'absolute',
    top: -16,
    zIndex: 14,
    alignSelf: 'center',
  },
  sunglassesFrame: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    top: 1,
    zIndex: 12,
  },
  sunglassLens: {
    width: 13,
    height: 9,
    borderRadius: 3,
    backgroundColor: '#05070A',
    borderWidth: 1.5,
  },
  sunglassBridge: {
    width: 4,
    height: 2,
  },
  boomboxBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 4,
    zIndex: 12,
  },
  emoteTray: {
    width: '100%',
    marginTop: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  emoteScrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
  },
  emotePillBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  emotePillIcon: {
    fontSize: 16,
  },
  emotePillLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  treatTray: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  treatBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  treatEmoji: {
    fontSize: 18,
  },
  treatLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
});
