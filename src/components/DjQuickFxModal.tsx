import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppTheme } from '../types';
import { TactileButton } from './TactileButton';
import { soundFxService, DjSoundEffect } from '../services/soundFxService';
import { AudioPlayerService } from '../services/audioPlayer';

interface DjQuickFxModalProps {
  visible: boolean;
  onClose: () => void;
  theme: AppTheme;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PAD_SIZE = Math.min(SCREEN_WIDTH - 64, 300);

export const DjQuickFxModal: React.FC<DjQuickFxModalProps> = ({
  visible,
  onClose,
  theme,
}) => {
  const player = AudioPlayerService.getInstance();
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [currentPitchRatio, setCurrentPitchRatio] = useState<number>(1.0);

  // XY Pad PanResponder values
  const padX = useRef(new Animated.Value(0)).current;
  const padY = useRef(new Animated.Value(0)).current;

  const triggerSfx = async (effect: DjSoundEffect, label: string) => {
    setActiveEffect(label);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    await soundFxService.playSoundEffect(effect);
    setTimeout(() => {
      setActiveEffect(null);
    }, 1200);
  };

  const xyPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handlePadMove(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      },
      onPanResponderMove: (evt) => {
        handlePadMove(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },
      onPanResponderRelease: () => {
        // Spring return to center
        Animated.parallel([
          Animated.spring(padX, { toValue: 0, useNativeDriver: true, bounciness: 10 }),
          Animated.spring(padY, { toValue: 0, useNativeDriver: true, bounciness: 10 }),
        ]).start();

        player.setPlaybackSpeed(1.0);
        setCurrentPitchRatio(1.0);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      },
    })
  ).current;

  const handlePadMove = (touchX: number, touchY: number) => {
    const half = PAD_SIZE / 2;
    const clampedX = Math.max(-half, Math.min(half, touchX - half));
    const clampedY = Math.max(-half, Math.min(half, touchY - half));

    padX.setValue(clampedX);
    padY.setValue(clampedY);

    // Map X to Pitch Speed (0.75x to 1.5x)
    const normX = clampedX / half; // -1 to +1
    const speed = 1.0 + normX * 0.45;
    const clampedSpeed = Math.max(0.6, Math.min(1.6, Math.round(speed * 100) / 100));

    player.setPlaybackSpeed(clampedSpeed);
    setCurrentPitchRatio(clampedSpeed);
  };

  const sfxList: { id: DjSoundEffect; label: string; icon: any }[] = [
    { id: 'airhorn', label: 'AIRHORN', icon: 'megaphone' },
    { id: 'vinyl_brake', label: 'BRAKE', icon: 'pause-circle' },
    { id: 'tape_rewind', label: 'REWIND', icon: 'play-back' },
    { id: 'sub_drop_808', label: '808 BOOM', icon: 'radio' },
    { id: 'scratch_chirp', label: 'CHIRP', icon: 'disc' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.surfaceBorder }]}>
          <View style={styles.headerLeft}>
            <Ionicons name="musical-notes" size={20} color={theme.accent} />
            <Text style={[styles.title, { color: theme.textPrimary }]}>DJ PERFORMANCE PAD</Text>
          </View>
          <TactileButton onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={theme.textPrimary} />
          </TactileButton>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Quick Sound FX Triggers Grid */}
          <Text style={[styles.sectionLabel, { color: theme.accent }]}>
            ONE-SHOT DJ SOUND FX
          </Text>

          <View style={styles.sfxRow}>
            {sfxList.map((item) => {
              const isFired = activeEffect === item.label;
              return (
                <TactileButton
                  key={item.id}
                  onPress={() => triggerSfx(item.id, item.label)}
                  style={[
                    styles.sfxCard,
                    {
                      backgroundColor: isFired ? theme.accent : theme.surface,
                      borderColor: isFired ? theme.accent : theme.surfaceBorder,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={isFired ? theme.background : theme.accent}
                  />
                  <Text
                    style={[
                      styles.sfxLabel,
                      { color: isFired ? theme.background : theme.textPrimary },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TactileButton>
              );
            })}
          </View>

          {/* Touch XY Filter & Pitch Bend Pad */}
          <View style={styles.xySection}>
            <View style={styles.xyHeaderRow}>
              <Text style={[styles.sectionLabel, { color: theme.accent }]}>
                INTERACTIVE XY PITCH & FILTER PAD
              </Text>
              <Text style={[styles.pitchSpeedBadge, { color: theme.accent, backgroundColor: `${theme.accent}20` }]}>
                {currentPitchRatio.toFixed(2)}x PITCH
              </Text>
            </View>

            <View
              style={[
                styles.xyPadStage,
                {
                  width: PAD_SIZE,
                  height: PAD_SIZE,
                  backgroundColor: theme.surface,
                  borderColor: theme.accent,
                },
              ]}
              {...xyPanResponder.panHandlers}
            >
              {/* Grid Lines */}
              <View style={[styles.gridLineH, { borderColor: `${theme.accent}30` }]} />
              <View style={[styles.gridLineV, { borderColor: `${theme.accent}30` }]} />

              {/* Axis Labels */}
              <Text style={[styles.axisLabelLeft, { color: theme.textTertiary }]}>0.75x Slow</Text>
              <Text style={[styles.axisLabelRight, { color: theme.textTertiary }]}>1.50x Fast</Text>
              <Text style={[styles.axisLabelTop, { color: theme.textTertiary }]}>Hi Filter</Text>
              <Text style={[styles.axisLabelBottom, { color: theme.textTertiary }]}>Lo Bass</Text>

              {/* Glowing Crosshair Puck */}
              <Animated.View
                style={[
                  styles.crosshairPuck,
                  {
                    backgroundColor: theme.accent,
                    shadowColor: theme.accent,
                    transform: [{ translateX: padX }, { translateY: padY }],
                  },
                ]}
              >
                <View style={styles.crosshairCenterDot} />
              </Animated.View>
            </View>

            <Text style={[styles.padHint, { color: theme.textSecondary }]}>
              Drag finger on pad to bend pitch and filter in real-time. Releases automatically to 1.0x.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  sfxRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sfxCard: {
    flex: 1,
    minWidth: 95,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  sfxLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  xySection: {
    marginTop: 8,
    alignItems: 'center',
  },
  xyHeaderRow: {
    width: PAD_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pitchSpeedBadge: {
    fontSize: 11,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  xyPadStage: {
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    borderLeftWidth: 1,
    borderStyle: 'dashed',
  },
  crosshairPuck: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 6,
  },
  crosshairCenterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  axisLabelLeft: {
    position: 'absolute',
    left: 8,
    top: '47%',
    fontSize: 9,
    fontWeight: '700',
  },
  axisLabelRight: {
    position: 'absolute',
    right: 8,
    top: '47%',
    fontSize: 9,
    fontWeight: '700',
  },
  axisLabelTop: {
    position: 'absolute',
    top: 6,
    fontSize: 9,
    fontWeight: '700',
  },
  axisLabelBottom: {
    position: 'absolute',
    bottom: 6,
    fontSize: 9,
    fontWeight: '700',
  },
  padHint: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16,
  },
});
