import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { TactileButton } from '../components/TactileButton';
import { SmartMixService, SmartDailyMix } from '@/src/services/smartMixService';
import { StorageService } from '@/src/services/playlistStorage';
import { Playlist, ListeningStats } from '@/src/types';

export default function PlaylistsTab() {
  const {
    theme,
    tracks,
    playlists,
    setSelectedPlaylist,
    setPlaylistsOpen,
    setAddTrackToPlaylistTarget,
    handleScanDevice,
    setThemeSwitcherOpen,
    handlePlayAll,
  } = useMusicPlayer();

  const [stats, setStats] = useState<ListeningStats | null>(null);

  useEffect(() => {
    StorageService.getListeningStats().then((s) => setStats(s));
  }, []);

  const dailyMixes = useMemo(() => {
    return SmartMixService.generateDailyMixes(tracks, stats || undefined);
  }, [tracks, stats]);

  const handleOpenMix = (mix: SmartDailyMix) => {
    const virtualPlaylist: Playlist = {
      id: mix.id,
      name: mix.title,
      createdAt: Date.now(),
      trackIds: mix.tracks.map((t) => t.id),
    };
    setSelectedPlaylist(virtualPlaylist);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.brandEyebrow, { color: theme.accent }]}>
            PIXEL MATERIAL PLAYLISTS
          </Text>
          <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>
            Playlists & Mixes
          </Text>
        </View>

        <View style={styles.headerButtonsRow}>
          <TactileButton
            onPress={() => setThemeSwitcherOpen(true)}
            style={[styles.headerIconBtn, { backgroundColor: theme.surfaceLight }]}
          >
            <Ionicons name="color-palette-outline" size={20} color={theme.accent} />
          </TactileButton>

          <TactileButton
            onPress={handleScanDevice}
            style={[styles.headerIconBtn, { backgroundColor: theme.surfaceLight }]}
          >
            <Ionicons name="scan-outline" size={20} color={theme.textPrimary} />
          </TactileButton>
        </View>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View>
            {/* Daily Mixes Shelf (PixelPlayer Feature) */}
            <View style={styles.dailyMixSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="sparkles" size={16} color={theme.accent} />
                  <Text style={[styles.subSectionTitle, { color: theme.textSecondary }]}>
                    OFFLINE DAILY MIXES
                  </Text>
                </View>
                <Text style={[styles.offlineBadge, { color: theme.accent, backgroundColor: `${theme.accent}1A` }]}>
                  100% OFFLINE AI
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dailyMixScroll}
              >
                {dailyMixes.map((mix) => (
                  <TactileButton
                    key={mix.id}
                    onPress={() => handleOpenMix(mix)}
                    style={[
                      styles.dailyMixCard,
                      { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
                    ]}
                  >
                    <View style={[styles.dailyMixIconBox, { backgroundColor: `${mix.color}22` }]}>
                      <Ionicons name={mix.icon as any} size={28} color={mix.color} />
                    </View>

                    <Text style={[styles.dailyMixTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {mix.title}
                    </Text>
                    <Text style={[styles.dailyMixSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                      {mix.subtitle}
                    </Text>

                    <View style={styles.dailyMixFooter}>
                      <Text style={[styles.dailyMixCount, { color: theme.textTertiary }]}>
                        {mix.tracks.length} {mix.tracks.length === 1 ? 'track' : 'tracks'}
                      </Text>
                      <TactileButton
                        onPress={() => handlePlayAll(mix.tracks, false)}
                        style={[styles.mixPlayBtn, { backgroundColor: mix.color }]}
                      >
                        <Ionicons name="play" size={13} color="#FFFFFF" />
                      </TactileButton>
                    </View>
                  </TactileButton>
                ))}
              </ScrollView>
            </View>

            {/* Custom Playlists Section Header */}
            <View style={styles.playlistActionRow}>
              <Text style={[styles.subSectionTitle, { color: theme.textSecondary }]}>
                MY PLAYLISTS ({playlists.length})
              </Text>
              <TactileButton
                onPress={() => {
                  setAddTrackToPlaylistTarget(null);
                  setPlaylistsOpen(true);
                }}
                style={[styles.createPlBtn, { backgroundColor: theme.accent }]}
              >
                <Ionicons name="add" size={16} color={theme.background} />
                <Text style={[styles.createPlBtnText, { color: theme.background }]}>New</Text>
              </TactileButton>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TactileButton
            onPress={() => setSelectedPlaylist(item)}
            style={[
              styles.folderCard,
              { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
            ]}
          >
            <View style={[styles.folderIconBox, { backgroundColor: theme.surfaceLight }]}>
              <Ionicons name="musical-notes" size={24} color={theme.accent} />
            </View>
            <View style={styles.folderInfoCol}>
              <Text style={[styles.folderTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.folderMeta, { color: theme.textSecondary }]}>
                {item.trackIds.length} {item.trackIds.length === 1 ? 'track' : 'tracks'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </TactileButton>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={48} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No custom playlists yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
              Tap "+ New" above to organize your offline music collection.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  brandEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 160,
  },
  dailyMixSection: {
    marginTop: 12,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  offlineBadge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    letterSpacing: 0.5,
  },
  dailyMixScroll: {
    gap: 12,
    paddingRight: 20,
  },
  dailyMixCard: {
    width: 156,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  dailyMixIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  dailyMixTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  dailyMixSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
  },
  dailyMixFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyMixCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  mixPlayBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 12,
  },
  createPlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  createPlBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 14,
  },
  folderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderInfoCol: {
    flex: 1,
  },
  folderTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  folderMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingHorizontal: 30,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
