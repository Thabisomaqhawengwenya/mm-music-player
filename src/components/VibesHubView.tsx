import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Track, AppTheme } from '../types';
import { TactileButton } from './TactileButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VibesHubViewProps {
  tracks: Track[];
  theme: AppTheme;
  currentTrackId?: string;
  isPlaying: boolean;
  onPlayTrack: (track: Track, trackList?: Track[]) => void;
  onToggleFavorite: (trackId: string) => void;
  onPlayNext: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
}

export type VibeCategory =
  | 'late_night'
  | 'high_energy'
  | 'deep_focus'
  | 'sunset_chill'
  | 'cyber_neon'
  | 'loved_gems';

interface VibeDefinition {
  id: VibeCategory;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  accentBg: string;
  keywords: string[];
}

const VIBE_STATIONS: VibeDefinition[] = [
  {
    id: 'late_night',
    title: 'Late Night Lo-Fi',
    subtitle: 'Midnight Mellow',
    description: 'Slow tempos, warm acoustic textures, and mellow basslines for after-dark listening.',
    icon: 'moon',
    color: '#a855f7',
    accentBg: 'rgba(168, 85, 247, 0.14)',
    keywords: ['chill', 'night', 'lo-fi', 'slow', 'dark', 'midnight', 'relax', 'sleep'],
  },
  {
    id: 'high_energy',
    title: 'High Energy Pulse',
    subtitle: 'Workout & Tempo',
    description: 'Driving rhythms, dynamic drops, and fast cadence to power your runs and gym sessions.',
    icon: 'flash',
    color: '#00e5ff',
    accentBg: 'rgba(0, 229, 255, 0.14)',
    keywords: ['rock', 'dance', 'electronic', 'workout', 'run', 'fast', 'beat', 'hype'],
  },
  {
    id: 'deep_focus',
    title: 'Deep Focus Flow',
    subtitle: 'Study & Coding',
    description: 'Clean instrumental passages and minimal vocal distraction for uninterrupted flow.',
    icon: 'infinite',
    color: '#10b981',
    accentBg: 'rgba(16, 185, 129, 0.14)',
    keywords: ['ambient', 'focus', 'piano', 'study', 'work', 'code', 'minimal', 'calm'],
  },
  {
    id: 'sunset_chill',
    title: 'Sunset Acoustic',
    subtitle: 'Warm & Intimate',
    description: 'Golden hour harmonies, acoustic guitars, and organic instrumentation.',
    icon: 'sunny',
    color: '#f59e0b',
    accentBg: 'rgba(245, 158, 11, 0.14)',
    keywords: ['acoustic', 'folk', 'guitar', 'warm', 'sunset', 'vocal', 'indie', 'soul'],
  },
  {
    id: 'cyber_neon',
    title: 'Cyber Neon Drift',
    subtitle: 'Synth & Groove',
    description: 'Futuristic synthesizer arpeggios, analog drum machines, and retrowave grooves.',
    icon: 'planet',
    color: '#ec4899',
    accentBg: 'rgba(236, 72, 153, 0.14)',
    keywords: ['synth', 'cyber', 'retro', 'wave', 'electro', 'neon', 'future', 'club'],
  },
  {
    id: 'loved_gems',
    title: 'Loved Gems',
    subtitle: 'Favorites & Classics',
    description: 'Your starred anthems, top replays, and most treasured offline tracks.',
    icon: 'heart',
    color: '#ef4444',
    accentBg: 'rgba(239, 68, 68, 0.14)',
    keywords: ['favorite', 'love', 'best', 'top', 'classic', 'gem'],
  },
];

export const VibesHubView: React.FC<VibesHubViewProps> = ({
  tracks,
  theme,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onToggleFavorite,
  onPlayNext,
  onAddToQueue,
}) => {
  const [selectedVibe, setSelectedVibe] = useState<VibeCategory>('late_night');
  const [ambientLayer, setAmbientLayer] = useState<string | null>(null);

  const activeVibeDef = useMemo(
    () => VIBE_STATIONS.find((v) => v.id === selectedVibe) || VIBE_STATIONS[0],
    [selectedVibe]
  );

  // Filter tracks matching current vibe, falling back to all tracks if few matches
  const matchedTracks = useMemo(() => {
    if (selectedVibe === 'loved_gems') {
      const favs = tracks.filter((t) => t.isFavorite);
      return favs.length > 0 ? favs : tracks.slice(0, 8);
    }

    const matches = tracks.filter((track) => {
      const textToSearch = `${track.title} ${track.artist} ${track.album || ''} ${track.genre || ''}`.toLowerCase();
      return activeVibeDef.keywords.some((kw) => textToSearch.includes(kw));
    });

    // If zero or few specific keyword matches, offer a tailored slice from collection
    if (matches.length < 2) {
      return tracks;
    }
    return matches;
  }, [tracks, selectedVibe, activeVibeDef]);

  const handleStartVibeSession = () => {
    if (matchedTracks.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    // Shuffle the matched tracks for dynamic session playback
    const shuffled = [...matchedTracks].sort(() => Math.random() - 0.5);
    onPlayTrack(shuffled[0], shuffled);
  };

  const handleSelectVibe = (vibeId: VibeCategory) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedVibe(vibeId);
  };

  const AMBIENT_SOUNDS = [
    { id: 'rain', label: 'Rain', icon: 'rainy-outline' },
    { id: 'vinyl', label: 'Vinyl Crackle', icon: 'disc-outline' },
    { id: 'cafe', label: 'Cafe Ambience', icon: 'cafe-outline' },
    { id: 'fire', label: 'Campfire', icon: 'bonfire-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: theme.accent }]}>SMART OFFLINE SESSIONS</Text>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Vibe Stations</Text>
        </View>

        <TactileButton
          onPress={handleStartVibeSession}
          style={[styles.instantMixBtn, { backgroundColor: activeVibeDef.color }]}
        >
          <Ionicons name="play" size={14} color="#000" />
          <Text style={styles.instantMixText}>Start Vibe</Text>
        </TactileButton>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Horizontal Vibe Selector Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.vibePillsRow}
        >
          {VIBE_STATIONS.map((vibe) => {
            const isActive = selectedVibe === vibe.id;
            return (
              <TouchableOpacity
                key={vibe.id}
                onPress={() => handleSelectVibe(vibe.id)}
                activeOpacity={0.8}
                style={[
                  styles.vibePill,
                  {
                    backgroundColor: isActive ? vibe.accentBg : theme.surface,
                    borderColor: isActive ? vibe.color : theme.surfaceBorder,
                  },
                ]}
              >
                <Ionicons
                  name={vibe.icon}
                  size={15}
                  color={isActive ? vibe.color : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.vibePillText,
                    {
                      color: isActive ? vibe.color : theme.textSecondary,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {vibe.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured Hero Vibe Card */}
        <View
          style={[
            styles.heroVibeCard,
            {
              backgroundColor: theme.surface,
              borderColor: activeVibeDef.color,
            },
          ]}
        >
          <View
            style={[
              styles.heroGlowHaze,
              { backgroundColor: activeVibeDef.accentBg },
            ]}
          />

          <View style={styles.heroTopRow}>
            <View
              style={[
                styles.heroIconBadge,
                { backgroundColor: activeVibeDef.color },
              ]}
            >
              <Ionicons name={activeVibeDef.icon} size={26} color="#000" />
            </View>

            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.heroSubtitle, { color: activeVibeDef.color }]}>
                {activeVibeDef.subtitle.toUpperCase()}
              </Text>
              <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
                {activeVibeDef.title}
              </Text>
            </View>
          </View>

          <Text style={[styles.heroDesc, { color: theme.textSecondary }]}>
            {activeVibeDef.description}
          </Text>

          <View style={styles.heroFooterRow}>
            <View style={styles.trackCountBadge}>
              <Ionicons name="musical-notes" size={13} color={theme.textTertiary} />
              <Text style={[styles.trackCountText, { color: theme.textSecondary }]}>
                {matchedTracks.length} {matchedTracks.length === 1 ? 'Track' : 'Tracks'} Matched
              </Text>
            </View>

            <TactileButton
              onPress={handleStartVibeSession}
              style={[
                styles.heroPlaySessionBtn,
                { backgroundColor: activeVibeDef.color },
              ]}
            >
              <Ionicons name="play" size={16} color="#000" />
              <Text style={styles.heroPlaySessionText}>Play Session</Text>
            </TactileButton>
          </View>
        </View>

        {/* Ambient Atmosphere Layer (Optional Zen immersion) */}
        <View style={styles.ambientSection}>
          <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
            ATMOSPHERE SOUNDSCAPE
          </Text>
          <View style={styles.ambientRow}>
            {AMBIENT_SOUNDS.map((sound) => {
              const isSelected = ambientLayer === sound.id;
              return (
                <TouchableOpacity
                  key={sound.id}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setAmbientLayer(isSelected ? null : sound.id);
                  }}
                  style={[
                    styles.ambientBtn,
                    {
                      backgroundColor: isSelected
                        ? activeVibeDef.accentBg
                        : theme.surfaceLight,
                      borderColor: isSelected
                        ? activeVibeDef.color
                        : theme.surfaceBorder,
                    },
                  ]}
                >
                  <Ionicons
                    name={sound.icon as any}
                    size={15}
                    color={isSelected ? activeVibeDef.color : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.ambientBtnText,
                      {
                        color: isSelected ? activeVibeDef.color : theme.textSecondary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {sound.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Matched Tracks List */}
        <View style={styles.tracksSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
              STATION TRACKS ({matchedTracks.length})
            </Text>
            <TouchableOpacity
              onPress={handleStartVibeSession}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Ionicons name="shuffle" size={14} color={activeVibeDef.color} />
              <Text style={[styles.shuffleText, { color: activeVibeDef.color }]}>Shuffle All</Text>
            </TouchableOpacity>
          </View>

          {matchedTracks.map((item, idx) => {
            const isItemPlaying = isPlaying && currentTrackId === item.id;
            return (
              <TactileButton
                key={item.id}
                onPress={() => onPlayTrack(item, matchedTracks)}
                style={[
                  styles.trackCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: isItemPlaying ? activeVibeDef.color : theme.surfaceBorder,
                  },
                ]}
              >
                {/* Artwork or vinyl icon */}
                <View style={styles.artCol}>
                  {item.artwork ? (
                    <Image source={{ uri: item.artwork }} style={styles.artThumb} />
                  ) : (
                    <View style={[styles.artThumbPlaceholder, { backgroundColor: theme.surfaceLight }]}>
                      <Ionicons
                        name="disc-outline"
                        size={18}
                        color={isItemPlaying ? activeVibeDef.color : theme.textTertiary}
                      />
                    </View>
                  )}
                </View>

                {/* Track Title & Artist */}
                <View style={styles.infoCol}>
                  <Text
                    style={[
                      styles.trackTitle,
                      {
                        color: isItemPlaying ? activeVibeDef.color : theme.textPrimary,
                        fontWeight: isItemPlaying ? '800' : '600',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text style={[styles.trackArtist, { color: theme.textSecondary }]} numberOfLines={1}>
                    {item.artist} • {activeVibeDef.subtitle}
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.trackActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      onToggleFavorite(item.id);
                    }}
                    style={styles.actionBtn}
                  >
                    <Ionicons
                      name={item.isFavorite ? 'heart' : 'heart-outline'}
                      size={18}
                      color={item.isFavorite ? '#FF2D55' : theme.textTertiary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => onAddToQueue(item)}
                    style={styles.actionBtn}
                  >
                    <Ionicons name="add-circle-outline" size={19} color={theme.textTertiary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => onPlayTrack(item, matchedTracks)}
                    style={[
                      styles.miniPlayBtn,
                      { backgroundColor: isItemPlaying ? activeVibeDef.color : theme.surfaceLight },
                    ]}
                  >
                    <Ionicons
                      name={isItemPlaying ? 'pause' : 'play'}
                      size={13}
                      color={isItemPlaying ? '#000' : theme.textPrimary}
                    />
                  </TouchableOpacity>
                </View>
              </TactileButton>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.4,
  },
  instantMixBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  instantMixText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
  },
  scrollContent: {
    paddingBottom: 130,
  },
  vibePillsRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 14,
  },
  vibePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  vibePillText: {
    fontSize: 12,
  },
  heroVibeCard: {
    marginHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1.2,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
  },
  heroGlowHaze: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroIconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  heroDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 14,
  },
  heroFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  trackCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trackCountText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  heroPlaySessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  heroPlaySessionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
  },
  ambientSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginBottom: 10,
  },
  ambientRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ambientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  ambientBtnText: {
    fontSize: 11.5,
  },
  tracksSection: {
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  shuffleText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  artCol: {
    marginRight: 10,
  },
  artThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  artThumbPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 13.5,
  },
  trackArtist: {
    fontSize: 11.5,
    marginTop: 2,
  },
  trackActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
  miniPlayBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
