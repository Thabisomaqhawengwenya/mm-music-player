import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMusicPlayer, LibrarySubTab } from '../context/MusicPlayerContext';
import { TactileButton } from '../components/TactileButton';
import { TrackListItem } from '../components/TrackListItem';
import { AlbumsView } from '../components/AlbumsView';
import { GenresView } from '../components/GenresView';
import { formatFileSize } from '@/src/utils/formatters';

export default function LibraryTab() {
  const {
    theme,
    tracks,
    isLoading,
    playbackState,
    librarySubTab,
    setLibrarySubTab,
    selectedFolder,
    setSelectedFolder,
    albums,
    artists,
    genres,
    folders,
    libraryTracks,
    totalDurationMinutes,
    setSelectedAlbum,
    setSelectedArtist,
    setSelectedGenre,
    handlePlayTrack,
    handlePlayAll,
    handlePlayNext,
    handleAddToQueue,
    handleAddToPlaylist,
    handleEditTags,
    handleToggleFavorite,
    handleScanDevice,
    handlePickFiles,
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
            Local Music
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

      {/* Screen Content */}
      <View style={styles.mainContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Scanning storage & audio files...
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {/* Library Sub-Tabs Ribbon */}
            <View style={styles.subTabsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.subTabsRow}
              >
                {[
                  { key: 'tracks', label: 'Tracks' },
                  { key: 'albums', label: 'Albums' },
                  { key: 'artists', label: 'Artists' },
                  { key: 'folders', label: 'Folders' },
                  { key: 'genres', label: 'Genres' },
                  { key: 'favorites', label: 'Favorites' },
                ].map((item) => {
                  const isActive = librarySubTab === item.key;
                  return (
                    <TactileButton
                      key={item.key}
                      onPress={() => {
                        setLibrarySubTab(item.key as LibrarySubTab);
                        setSelectedFolder(null);
                      }}
                      style={[
                        styles.subTabItem,
                        isActive && { borderBottomColor: theme.accent, borderBottomWidth: 2 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.subTabText,
                          { color: isActive ? theme.accent : theme.textSecondary },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TactileButton>
                  );
                })}
              </ScrollView>
            </View>

            {/* Breadcrumb if inside a selected folder */}
            {selectedFolder && (
              <View style={styles.breadcrumbBar}>
                <TactileButton
                  onPress={() => setSelectedFolder(null)}
                  style={styles.breadcrumbBtn}
                >
                  <Ionicons name="arrow-back" size={16} color={theme.accent} />
                  <Text style={[styles.breadcrumbText, { color: theme.accent }]}>
                    All Folders
                  </Text>
                </TactileButton>
                <Text style={[styles.breadcrumbCurrent, { color: theme.textPrimary }]} numberOfLines={1}>
                  {selectedFolder}
                </Text>
              </View>
            )}

            {/* Library Stats / Quick Shuffle Bar */}
            <View style={styles.statsBar}>
              <Text style={[styles.statsText, { color: theme.textTertiary }]}>
                {tracks.length} tracks • {totalDurationMinutes} mins total
              </Text>
              <TactileButton
                onPress={() => handlePlayAll(libraryTracks, true)}
                style={styles.shuffleAllBtn}
              >
                <Ionicons name="shuffle" size={14} color={theme.accent} />
                <Text style={[styles.shuffleAllText, { color: theme.accent }]}>Shuffle All</Text>
              </TactileButton>
            </View>

            {/* Sub-tab view switch */}
            {librarySubTab === 'albums' ? (
              <AlbumsView
                albums={albums}
                theme={theme}
                onSelectAlbum={(alb: any) => setSelectedAlbum(alb)}
              />
            ) : librarySubTab === 'genres' ? (
              <GenresView
                genres={genres}
                theme={theme}
                onSelectGenre={(gen: any) => setSelectedGenre(gen)}
              />
            ) : librarySubTab === 'artists' ? (
              /* Artists List */
              <FlatList
                data={artists}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                  <TactileButton
                    onPress={() => setSelectedArtist(item)}
                    style={[
                      styles.folderCard,
                      { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
                    ]}
                  >
                    <View style={[styles.folderIconBox, { backgroundColor: theme.surfaceLight }]}>
                      <Ionicons name="person" size={24} color={theme.accent} />
                    </View>
                    <View style={styles.folderInfoCol}>
                      <Text style={[styles.folderTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.folderMeta, { color: theme.textSecondary }]}>
                        {item.trackCount} {item.trackCount === 1 ? 'song' : 'songs'} • {item.albumCount} {item.albumCount === 1 ? 'album' : 'albums'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
                  </TactileButton>
                )}
              />
            ) : librarySubTab === 'folders' && !selectedFolder ? (
              /* Folders List */
              <FlatList
                data={folders}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                  <TactileButton
                    onPress={() => setSelectedFolder(item.name)}
                    style={[
                      styles.folderCard,
                      { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
                    ]}
                  >
                    <View style={[styles.folderIconBox, { backgroundColor: theme.surfaceLight }]}>
                      <Ionicons name="folder" size={24} color={theme.accent} />
                    </View>
                    <View style={styles.folderInfoCol}>
                      <Text style={[styles.folderTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.folderMeta, { color: theme.textSecondary }]}>
                        {item.count} {item.count === 1 ? 'track' : 'tracks'} {item.size > 0 ? `• ${formatFileSize(item.size)}` : ''}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
                  </TactileButton>
                )}
              />
            ) : (
              /* Tracks & Favorites FlatList */
              <FlatList
                data={libraryTracks}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item, index }) => (
                  <TrackListItem
                    track={item}
                    index={index}
                    isCurrent={playbackState.currentTrack?.id === item.id}
                    isPlaying={playbackState.isPlaying}
                    theme={theme}
                    onPress={() => handlePlayTrack(item, libraryTracks)}
                    onToggleFavorite={handleToggleFavorite}
                    onPlayNext={handlePlayNext}
                    onAddToQueue={handleAddToQueue}
                    onAddToPlaylist={handleAddToPlaylist}
                    onEditTags={handleEditTags}
                  />
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="musical-notes-outline" size={54} color={theme.textTertiary} />
                    <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                      {librarySubTab === 'favorites' ? 'No favorites yet' : 'No local music found'}
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
                      {librarySubTab === 'favorites'
                        ? 'Tap the heart icon on any song to add it to your favorites.'
                        : 'Tap "Pick Audio Files" or grant storage permissions to scan your device.'}
                    </Text>
                    {librarySubTab !== 'favorites' && (
                      <TactileButton
                        onPress={handlePickFiles}
                        style={[styles.emptyPickBtn, { backgroundColor: theme.accent }]}
                      >
                        <Text style={[styles.emptyPickBtnText, { color: theme.background }]}>
                          Pick Audio Files
                        </Text>
                      </TactileButton>
                    )}
                  </View>
                }
              />
            )}
          </View>
        )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subTabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  subTabsRow: {
    paddingHorizontal: 20,
    gap: 24,
  },
  subTabItem: {
    paddingVertical: 12,
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  breadcrumbBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breadcrumbText: {
    fontSize: 13,
    fontWeight: '600',
  },
  breadcrumbCurrent: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  statsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  shuffleAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  shuffleAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 20,
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
  emptyPickBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 12,
  },
  emptyPickBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
