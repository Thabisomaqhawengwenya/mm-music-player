import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme, AudioSettings } from '../types';
import { THEMES } from '../constants/theme';
import { StorageService } from '../services/playlistStorage';
import { TactileButton } from './TactileButton';

interface SettingsViewProps {
  theme: AppTheme;
  onThemeChanged: (newTheme: AppTheme) => void;
  onOpenCloudSync: () => void;
  onScanDevice: () => void;
  onPickFiles: () => void;
  onSettingsChanged: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  onThemeChanged,
  onOpenCloudSync,
  onScanDevice,
  onPickFiles,
  onSettingsChanged,
}) => {
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    crossfadeDuration: 3,
    minDurationSeconds: 30,
    excludeFolders: ['WhatsApp Audio', 'Notifications', 'Ringtones'],
    gaplessPlayback: true,
    normalizeVolume: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await StorageService.getAudioSettings();
    setAudioSettings(s);
  };

  const updateSetting = async <K extends keyof AudioSettings>(key: K, value: AudioSettings[K]) => {
    const updated = { ...audioSettings, [key]: value };
    setAudioSettings(updated);
    await StorageService.saveAudioSettings(updated);
    onSettingsChanged();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Audio Engine Section */}
      <View style={styles.sectionHeaderRow}>
        <Ionicons name="hardware-chip-outline" size={18} color={theme.accent} />
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>AUDIO DSP & ENGINE</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
        {/* Min Duration Filter */}
        <View style={styles.row}>
          <View style={styles.rowTextCol}>
            <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Filter Out Short Audio</Text>
            <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
              Hides voice notes and ringtones under {audioSettings.minDurationSeconds}s
            </Text>
          </View>
        </View>

        <View style={styles.pillSelectorRow}>
          {[0, 15, 30, 60].map((sec) => (
            <TactileButton
              key={sec}
              onPress={() => updateSetting('minDurationSeconds', sec)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: audioSettings.minDurationSeconds === sec ? theme.accent : theme.surfaceLight,
                  borderColor: audioSettings.minDurationSeconds === sec ? theme.accent : theme.surfaceBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: audioSettings.minDurationSeconds === sec ? theme.background : theme.textSecondary },
                ]}
              >
                {sec === 0 ? 'Off (Show All)' : `>${sec}s`}
              </Text>
            </TactileButton>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

        {/* Crossfade */}
        <View style={styles.row}>
          <View style={styles.rowTextCol}>
            <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Crossfade Duration</Text>
            <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
              {audioSettings.crossfadeDuration === 0
                ? 'Instant track changes'
                : `${audioSettings.crossfadeDuration}s transition between songs`}
            </Text>
          </View>
        </View>

        <View style={styles.pillSelectorRow}>
          {[0, 3, 5, 8].map((sec) => (
            <TactileButton
              key={sec}
              onPress={() => updateSetting('crossfadeDuration', sec)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: audioSettings.crossfadeDuration === sec ? theme.accent : theme.surfaceLight,
                  borderColor: audioSettings.crossfadeDuration === sec ? theme.accent : theme.surfaceBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: audioSettings.crossfadeDuration === sec ? theme.background : theme.textSecondary },
                ]}
              >
                {sec === 0 ? '0s (None)' : `${sec}s`}
              </Text>
            </TactileButton>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

        {/* Gapless Playback */}
        <View style={styles.switchRow}>
          <View style={styles.rowTextCol}>
            <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Gapless Playback</Text>
            <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
              Continuous flow without silent gaps
            </Text>
          </View>
          <Switch
            value={audioSettings.gaplessPlayback}
            onValueChange={(val) => updateSetting('gaplessPlayback', val)}
            trackColor={{ false: theme.surfaceLight, true: theme.accent }}
            thumbColor={theme.textPrimary}
          />
        </View>
      </View>

      {/* 2. Theme & Visual Style Section */}
      <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
        <Ionicons name="color-palette-outline" size={18} color={theme.accent} />
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>THEME & APPEARANCE</Text>
      </View>

      <View style={styles.themesGrid}>
        {Object.values(THEMES).map((t) => {
          const isSelected = theme.id === t.id;
          return (
            <TactileButton
              key={t.id}
              onPress={async () => {
                await StorageService.saveThemeId(t.id);
                onThemeChanged(t);
              }}
              style={[
                styles.themeCard,
                {
                  backgroundColor: t.surface,
                  borderColor: isSelected ? t.accent : theme.surfaceBorder,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              <View style={[styles.themePreviewPalette, { backgroundColor: t.background }]}>
                <View style={[styles.themeAccentDot, { backgroundColor: t.accent }]} />
                <View style={[styles.themeSurfaceBar, { backgroundColor: t.surfaceLight }]} />
              </View>
              <Text style={[styles.themeCardName, { color: isSelected ? t.accent : theme.textPrimary }]}>
                {t.name}
              </Text>
            </TactileButton>
          );
        })}
      </View>

      {/* 3. Storage & Library Maintenance */}
      <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
        <Ionicons name="folder-outline" size={18} color={theme.accent} />
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>STORAGE & LIBRARY SCAN</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
        <TactileButton onPress={onScanDevice} style={styles.actionRowBtn}>
          <View style={[styles.actionIconBox, { backgroundColor: `${theme.accent}20` }]}>
            <Ionicons name="scan-outline" size={20} color={theme.accent} />
          </View>
          <View style={styles.rowTextCol}>
            <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Rescan Device Storage</Text>
            <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
              Detect newly downloaded songs
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
        </TactileButton>

        <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

        <TactileButton onPress={onPickFiles} style={styles.actionRowBtn}>
          <View style={[styles.actionIconBox, { backgroundColor: `${theme.accent}20` }]}>
            <Ionicons name="document-text-outline" size={20} color={theme.accent} />
          </View>
          <View style={styles.rowTextCol}>
            <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Pick Specific Audio Files</Text>
            <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
              Import audio from Downloads or SD card
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
        </TactileButton>
      </View>

      {/* 4. Cloud Sync & Backup */}
      <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
        <Ionicons name="cloud-upload-outline" size={18} color={theme.accent} />
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>CLOUD BACKUP & SYNC</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
        <TactileButton onPress={onOpenCloudSync} style={styles.actionRowBtn}>
          <View style={[styles.actionIconBox, { backgroundColor: `${theme.accent}20` }]}>
            <Ionicons name="cloud-done-outline" size={20} color={theme.accent} />
          </View>
          <View style={styles.rowTextCol}>
            <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Cloud Sync Dashboard</Text>
            <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
              Sync playlists, favorites & tags with private backend
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
        </TactileButton>
      </View>

      {/* 5. About & Specs */}
      <View style={styles.aboutFooter}>
        <Text style={[styles.aboutBrand, { color: theme.accent }]}>MM HI-FI AUDIO PLAYER</Text>
        <Text style={[styles.aboutVersion, { color: theme.textTertiary }]}>
          Version 1.0.0 • Expo SDK 57 • 24-bit DSP
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  row: {
    marginBottom: 10,
  },
  rowTextCol: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  pillSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: '48%',
    borderRadius: 14,
    padding: 12,
  },
  themePreviewPalette: {
    height: 38,
    borderRadius: 8,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  themeAccentDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  themeSurfaceBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
  },
  themeCardName: {
    fontSize: 12,
    fontWeight: '800',
  },
  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutFooter: {
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 10,
  },
  aboutBrand: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  aboutVersion: {
    fontSize: 12,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
});
