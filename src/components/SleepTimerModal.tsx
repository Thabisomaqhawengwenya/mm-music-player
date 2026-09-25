import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../types';
import { AudioPlayerService } from '../services/audioPlayer';
import { TactileButton } from './TactileButton';
import { formatTime } from '../utils/formatters';

interface SleepTimerModalProps {
  visible: boolean;
  onClose: () => void;
  theme: AppTheme;
}

const TIMER_OPTIONS = [
  { label: '15 Minutes', minutes: 15 },
  { label: '30 Minutes', minutes: 30 },
  { label: '45 Minutes', minutes: 45 },
  { label: '60 Minutes (1 hr)', minutes: 60 },
  { label: '90 Minutes', minutes: 90 },
];

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  visible,
  onClose,
  theme,
}) => {
  const player = AudioPlayerService.getInstance();
  const [remaining, setRemaining] = useState<number | null>(player.getSleepTimerRemaining());

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (visible) {
      setRemaining(player.getSleepTimerRemaining());
      interval = setInterval(() => {
        setRemaining(player.getSleepTimerRemaining());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible]);

  const handleSelect = (minutes: number | null) => {
    player.setSleepTimer(minutes);
    setRemaining(player.getSleepTimerRemaining());
    if (minutes === null) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.modalWrapper}>
          <View
            style={[
              styles.contentCard,
              { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons name="moon" size={22} color={theme.accent} />
                <Text style={[styles.title, { color: theme.textPrimary }]}>SLEEP TIMER</Text>
              </View>
              <TactileButton onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={theme.textPrimary} />
              </TactileButton>
            </View>

            {/* Active Countdown Status */}
            {remaining !== null && (
              <View style={[styles.activeStatusCard, { backgroundColor: theme.surfaceLight, borderColor: theme.accent }]}>
                <Text style={[styles.activeStatusLabel, { color: theme.textSecondary }]}>
                  Playback will stop in
                </Text>
                <Text style={[styles.activeStatusCountdown, { color: theme.accent }]}>
                  {formatTime(remaining)}
                </Text>
              </View>
            )}

            {/* Presets List */}
            <View style={styles.optionsList}>
              {TIMER_OPTIONS.map((opt) => (
                <TactileButton
                  key={opt.minutes}
                  onPress={() => handleSelect(opt.minutes)}
                  style={[
                    styles.optionItem,
                    {
                      backgroundColor: theme.surfaceLight,
                      borderColor: theme.surfaceBorder,
                    },
                  ]}
                >
                  <Text style={[styles.optionText, { color: theme.textPrimary }]}>
                    {opt.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
                </TactileButton>
              ))}

              {/* Turn Off button */}
              {remaining !== null && (
                <TactileButton
                  onPress={() => handleSelect(null)}
                  style={[styles.cancelBtn, { borderColor: theme.danger }]}
                >
                  <Text style={[styles.cancelBtnText, { color: theme.danger }]}>
                    Turn Off Timer
                  </Text>
                </TactileButton>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalWrapper: {
    width: '100%',
    maxWidth: 400,
  },
  contentCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
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
    padding: 4,
  },
  activeStatusCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  activeStatusLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  activeStatusCountdown: {
    fontSize: 32,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  optionsList: {
    gap: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 6,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
