import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { TactileButton } from '../components/TactileButton';

export default function PlaylistsTab() {
  const {
    theme,
    playlists,
    setSelectedPlaylist,
    setPlaylistsOpen,
    setAddTrackToPlaylistTarget,
    handleScanDevice,
    setThemeSwitcherOpen,
  } = useMusicPlayer();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.brandEyebrow, { color: theme.accent }]}>
            HI-FI OFFLINE AUDIO
          </Text>
          <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>
            Playlists
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

      <View style={styles.mainContainer}>
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

        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
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
      </View>
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
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  playlistActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
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
  listContainer: {
    paddingBottom: 160,
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
    paddingTop: 60,
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
