import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppTheme, VisualizerMode } from '@/src/types';

interface DynamicVisualizerStageProps {
  isPlaying: boolean;
  theme: AppTheme;
  initialMode?: VisualizerMode;
  onModeChange?: (mode: VisualizerMode) => void;
}

export const DynamicVisualizerStage: React.FC<DynamicVisualizerStageProps> = ({
  isPlaying,
  theme,
  initialMode = 'spectrum',
  onModeChange,
}) => {
  const [mode, setMode] = useState<VisualizerMode>(initialMode);

  // 1. Spectrum 14 Bars
  const barAnims = useRef(Array.from({ length: 14 }, () => new Animated.Value(0.18))).current;

  // 2. Liquid Lava Blobs
  const blobScale1 = useRef(new Animated.Value(1)).current;
  const blobScale2 = useRef(new Animated.Value(0.8)).current;
  const blobScale3 = useRef(new Animated.Value(1.1)).current;

  // 3. CRT Oscilloscope 20 Wave points
  const wavePoints = useRef(Array.from({ length: 20 }, () => new Animated.Value(0))).current;

  // 4. Particle Starfield
  const starPulse = useRef(new Animated.Value(0)).current;

  // Animate according to active mode
  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;

    if (isPlaying) {
      if (mode === 'spectrum') {
        const barLoops = barAnims.map((anim, idx) => {
          const duration = 280 + (idx % 5) * 85;
          return Animated.loop(
            Animated.sequence([
              Animated.timing(anim, {
                toValue: 0.35 + Math.random() * 0.65,
                duration,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(anim, {
                toValue: 0.12 + Math.random() * 0.25,
                duration: duration * 0.9,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
              }),
            ])
          );
        });
        animLoop = Animated.parallel(barLoops);
        animLoop.start();
      } else if (mode === 'lava_blob') {
        animLoop = Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(blobScale1, { toValue: 1.35, duration: 650, useNativeDriver: true }),
              Animated.timing(blobScale1, { toValue: 0.9, duration: 650, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(blobScale2, { toValue: 0.75, duration: 520, useNativeDriver: true }),
              Animated.timing(blobScale2, { toValue: 1.25, duration: 520, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(blobScale3, { toValue: 1.2, duration: 800, useNativeDriver: true }),
              Animated.timing(blobScale3, { toValue: 0.85, duration: 800, useNativeDriver: true }),
            ]),
          ])
        );
        animLoop.start();
      } else if (mode === 'oscilloscope') {
        const waveLoops = wavePoints.map((anim, idx) => {
          const delay = idx * 45;
          return Animated.loop(
            Animated.sequence([
              Animated.delay(delay),
              Animated.timing(anim, { toValue: 12, duration: 240, useNativeDriver: true }),
              Animated.timing(anim, { toValue: -12, duration: 480, useNativeDriver: true }),
              Animated.timing(anim, { toValue: 0, duration: 240, useNativeDriver: true }),
            ])
          );
        });
        animLoop = Animated.parallel(waveLoops);
        animLoop.start();
      } else if (mode === 'particle_starfield') {
        animLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(starPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.timing(starPulse, { toValue: 0, duration: 900, useNativeDriver: true }),
          ])
        );
        animLoop.start();
      }
    } else {
      // Resting defaults
      barAnims.forEach((anim) => anim.setValue(0.15));
      wavePoints.forEach((anim) => anim.setValue(0));
      blobScale1.setValue(1);
      blobScale2.setValue(0.9);
      blobScale3.setValue(1);
      starPulse.setValue(0);
    }

    return () => {
      animLoop?.stop();
    };
  }, [isPlaying, mode]);

  const cycleMode = () => {
    const modes: VisualizerMode[] = ['spectrum', 'lava_blob', 'oscilloscope', 'particle_starfield'];
    const nextIdx = (modes.indexOf(mode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setMode(nextMode);
    if (onModeChange) onModeChange(nextMode);
    Haptics.selectionAsync().catch(() => {});
  };

  const modeLabels: Record<VisualizerMode, { name: string; icon: any }> = {
    spectrum: { name: 'SPECTRUM 14-BAND', icon: 'stats-chart' },
    lava_blob: { name: 'LAVA BASS BLOB', icon: 'water' },
    oscilloscope: { name: 'CRT OSCILLOSCOPE', icon: 'pulse' },
    particle_starfield: { name: 'PARTICLE VORTEX', icon: 'sparkles' },
  };

  const starScale = starPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1.35],
  });

  const starRotate = starPulse.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={cycleMode} style={styles.container}>
      {/* Mode Tag */}
      <View style={styles.modeTagRow}>
        <Ionicons name={modeLabels[mode].icon} size={11} color={theme.accent} />
        <Text style={[styles.modeTagText, { color: theme.accent }]}>
          {modeLabels[mode].name}
        </Text>
        <Ionicons name="swap-horizontal" size={10} color={theme.textTertiary} />
      </View>

      {/* Stage Surface according to mode */}
      <View style={styles.stageBody}>
        {mode === 'spectrum' ? (
          /* 1. SPECTRUM 14 BARS */
          <View style={styles.spectrumRow}>
            {barAnims.map((anim, idx) => (
              <Animated.View
                key={idx}
                style={[
                  styles.spectrumBar,
                  {
                    backgroundColor: theme.accent,
                    transform: [{ scaleY: anim }],
                  },
                ]}
              />
            ))}
          </View>
        ) : mode === 'lava_blob' ? (
          /* 2. LIQUID LAVA BASS BLOBS */
          <View style={styles.blobContainer}>
            <Animated.View
              style={[
                styles.lavaBlob,
                {
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: `${theme.accent}70`,
                  transform: [{ scale: blobScale1 }, { translateX: -18 }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.lavaBlob,
                {
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: theme.accent,
                  transform: [{ scale: blobScale2 }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.lavaBlob,
                {
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: `${theme.accent}80`,
                  transform: [{ scale: blobScale3 }, { translateX: 18 }],
                },
              ]}
            />
          </View>
        ) : mode === 'oscilloscope' ? (
          /* 3. CRT PHOSPHOR OSCILLOSCOPE */
          <View style={styles.oscilloscopeContainer}>
            <View style={[styles.crtScanline, { borderColor: `${theme.accent}40` }]} />
            <View style={styles.oscilloscopePointsRow}>
              {wavePoints.map((anim, idx) => (
                <Animated.View
                  key={idx}
                  style={[
                    styles.oscilloscopeDot,
                    {
                      backgroundColor: theme.accent,
                      transform: [{ translateY: anim }],
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        ) : (
          /* 4. PARTICLE VORTEX */
          <View style={styles.starfieldContainer}>
            <Animated.View
              style={[
                styles.starVortex,
                {
                  transform: [{ scale: starScale }, { rotate: starRotate }],
                },
              ]}
            >
              <Text style={{ fontSize: 22, color: theme.accent }}>✦ ♫ ✦</Text>
            </Animated.View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    width: '100%',
  },
  modeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
    opacity: 0.85,
  },
  modeTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  stageBody: {
    height: 40,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spectrumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 36,
    gap: 3.5,
  },
  spectrumBar: {
    width: 3.2,
    height: 36,
    borderRadius: 2,
    transformOrigin: 'bottom',
  },
  blobContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  lavaBlob: {
    position: 'absolute',
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  oscilloscopeContainer: {
    width: '80%',
    height: 36,
    justifyContent: 'center',
    position: 'relative',
  },
  crtScanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    borderTopWidth: 1,
  },
  oscilloscopePointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  oscilloscopeDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  starfieldContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
  },
  starVortex: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
