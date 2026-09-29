import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme, EqualizerPreset } from '@/src/types';
import { StorageService, EQ_PRESETS, defaultEqPreset } from '@/src/services/playlistStorage';
import { TactileButton } from './TactileButton';

interface EqualizerModalProps {
  visible: boolean;
  onClose: () => void;
  theme: AppTheme;
}

const FREQ_LABELS = ['60 Hz', '230 Hz', '910 Hz', '3.6 kHz', '14 kHz'];
const BAND_HEIGHT = 160;

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  visible,
  onClose,
  theme,
}) => {
  const [currentPreset, setCurrentPreset] = useState<EqualizerPreset>(defaultEqPreset);
  const [selectedPresetName, setSelectedPresetName] = useState<string>('Balanced Clean');

  useEffect(() => {
    if (visible) {
      loadEq();
    }
  }, [visible]);

  const loadEq = async () => {
    const saved = await StorageService.getEqSettings();
    setCurrentPreset(saved);
    setSelectedPresetName(saved.name);
  };

  const handleApplyPreset = async (preset: EqualizerPreset) => {
    setCurrentPreset({ ...preset });
    setSelectedPresetName(preset.name);
    await StorageService.saveEqSettings(preset);
  };

  const handleBandChange = async (index: number, newDb: number) => {
    const clamped = Math.max(-10, Math.min(10, Math.round(newDb)));
    const updatedBands = [...currentPreset.bands];
    updatedBands[index] = clamped;

    const updated = {
      ...currentPreset,
      name: 'Custom',
      bands: updatedBands,
    };
    setCurrentPreset(updated);
    setSelectedPresetName('Custom');
    await StorageService.saveEqSettings(updated);
  };

  const handleBassBoostChange = async (delta: number) => {
    const updated = {
      ...currentPreset,
      name: 'Custom',
      bassBoost: Math.max(0, Math.min(100, currentPreset.bassBoost + delta)),
    };
    setCurrentPreset(updated);
    setSelectedPresetName('Custom');
    await StorageService.saveEqSettings(updated);
  };

  const handleVirtualizerChange = async (delta: number) => {
    const updated = {
      ...currentPreset,
      name: 'Custom',
      virtualizer: Math.max(0, Math.min(100, currentPreset.virtualizer + delta)),
    };
    setCurrentPreset(updated);
    setSelectedPresetName('Custom');
    await StorageService.saveEqSettings(updated);
  };

  const createSliderPanResponder = (index: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Calculate dB from vertical drag
        const normalized = -gestureState.dy / (BAND_HEIGHT / 2);
        const deltaDb = normalized * 10;
        const baseDb = currentPreset.bands[index] || 0;
        handleBandChange(index, baseDb + deltaDb);
      },
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="options" size={24} color={theme.accent} />
            <Text style={[styles.title, { color: theme.textPrimary }]}>AUDIO EQUALIZER</Text>
          </View>
          <TactileButton onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={theme.textPrimary} />
          </TactileButton>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Preset Chips */}
          <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>PRESETS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
            {EQ_PRESETS.map((p) => {
              const isActive = selectedPresetName === p.name;
              return (
                <TactileButton
                  key={p.name}
                  onPress={() => handleApplyPreset(p)}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: isActive ? theme.accent : theme.surfaceLight,
                      borderColor: isActive ? theme.accent : theme.surfaceBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      { color: isActive ? theme.background : theme.textSecondary },
                    ]}
                  >
                    {p.name}
                  </Text>
                </TactileButton>
              );
            })}
          </ScrollView>

          {/* Equalizer Frequency Bands */}
          <View style={[styles.eqCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
            <View style={styles.bandsContainer}>
              {currentPreset.bands.map((db, idx) => {
                const panResponder = createSliderPanResponder(idx);
                // -10 to +10 dB maps to 0 to 100% height
                const fillPercent = ((db + 10) / 20) * 100;

                return (
                  <View key={FREQ_LABELS[idx]} style={styles.bandCol}>
                    <Text style={[styles.dbLabel, { color: theme.accent }]}>
                      {db > 0 ? `+${db}` : `${db}`}dB
                    </Text>

                    {/* Vertical Slider Track */}
                    <View
                      style={[styles.sliderTrack, { backgroundColor: theme.surfaceLight }]}
                      {...panResponder.panHandlers}
                    >
                      <View
                        style={[
                          styles.sliderFill,
                          {
                            height: `${fillPercent}%`,
                            backgroundColor: theme.accent,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.sliderThumb,
                          {
                            bottom: `${fillPercent}%`,
                            backgroundColor: theme.textPrimary,
                            borderColor: theme.accent,
                          },
                        ]}
                      />
                    </View>

                    <Text style={[styles.freqLabel, { color: theme.textSecondary }]}>
                      {FREQ_LABELS[idx]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Enhanced Audio DSP Controls */}
          <View style={styles.dspSection}>
            {/* Bass Boost */}
            <View style={[styles.dspCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <View style={styles.dspHeader}>
                <Ionicons name="hardware-chip-outline" size={20} color={theme.accent} />
                <Text style={[styles.dspTitle, { color: theme.textPrimary }]}>BASS BOOST</Text>
              </View>
              <Text style={[styles.dspValue, { color: theme.accent }]}>
                {currentPreset.bassBoost}%
              </Text>
              <View style={styles.dspBtnRow}>
                <TactileButton
                  onPress={() => handleBassBoostChange(-10)}
                  style={[styles.dspSmallBtn, { backgroundColor: theme.surfaceLight }]}
                >
                  <Ionicons name="remove" size={18} color={theme.textPrimary} />
                </TactileButton>
                <TactileButton
                  onPress={() => handleBassBoostChange(10)}
                  style={[styles.dspSmallBtn, { backgroundColor: theme.accent }]}
                >
                  <Ionicons name="add" size={18} color={theme.background} />
                </TactileButton>
              </View>
            </View>

            {/* 3D Virtualizer */}
            <View style={[styles.dspCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <View style={styles.dspHeader}>
                <Ionicons name="headset-outline" size={20} color={theme.accent} />
                <Text style={[styles.dspTitle, { color: theme.textPrimary }]}>VIRTUALIZER</Text>
              </View>
              <Text style={[styles.dspValue, { color: theme.accent }]}>
                {currentPreset.virtualizer}%
              </Text>
              <View style={styles.dspBtnRow}>
                <TactileButton
                  onPress={() => handleVirtualizerChange(-10)}
                  style={[styles.dspSmallBtn, { backgroundColor: theme.surfaceLight }]}
                >
                  <Ionicons name="remove" size={18} color={theme.textPrimary} />
                </TactileButton>
                <TactileButton
                  onPress={() => handleVirtualizerChange(10)}
                  style={[styles.dspSmallBtn, { backgroundColor: theme.accent }]}
                >
                  <Ionicons name="add" size={18} color={theme.background} />
                </TactileButton>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  presetChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  eqCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  bandsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bandCol: {
    alignItems: 'center',
    width: 56,
  },
  dbLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    fontVariant: ['tabular-nums'],
  },
  sliderTrack: {
    width: 10,
    height: BAND_HEIGHT,
    borderRadius: 5,
    overflow: 'visible',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  sliderFill: {
    width: '100%',
    borderRadius: 5,
  },
  sliderThumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    left: -6,
    marginBottom: -11,
  },
  freqLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 12,
  },
  dspSection: {
    flexDirection: 'row',
    gap: 14,
  },
  dspCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  dspHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  dspTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dspValue: {
    fontSize: 26,
    fontWeight: '900',
    marginVertical: 4,
  },
  dspBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  dspSmallBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
