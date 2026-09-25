import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  FlatList,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track, PlaybackState, AppTheme } from './src/types';
import { THEMES, DEFAULT_THEME } from './src/constants/theme';
import { StorageScannerService } from './src/services/storageScanner';
import { AudioPlayerService } from './src/services/audioPlayer';
import { StorageService } from './src/services/playlistStorage';
import { TactileButton } from './src/components/TactileButton';
import { TrackListItem } from './src/components/TrackListItem';
import { MiniPlayer } from './src/components/MiniPlayer';
import { NowPlayingModal } from './src/components/NowPlayingModal';
import { EqualizerModal } from './src/components/EqualizerModal';
import { SleepTimerModal } from './src/components/SleepTimerModal';
import { QueueModal } from './src/components/QueueModal';
import { PlaylistModal } from './src/components/PlaylistModal';
import { TagEditorModal } from './src/components/TagEditorModal';
import { ThemeSwitcherModal } from './src/components/ThemeSwitcherModal';
import { CloudSyncModal } from './src/components/CloudSyncModal';
import { formatFileSize } from './src/utils/formatters';

type TabKey = 'tracks' | 'folders' | 'artists' | 'favorites';

export default function App() {
  const [theme, setTheme] = useState<AppTheme>(DEFAULT_THEME);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabKey>('tracks');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  // Playback state
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    currentTrack: null,
    isPlaying: false,
    position: 0,
    duration: 0,
    playbackSpeed: 1.0,
    isBuffering: false,
    repeatMode: 'all',
    isShuffled: false,
    volume: 1.0,
  });

  // Modals state
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);
  const [equalizerOpen, setEqualizerOpen] = useState(false);
  const [sleepTimerOpen, setSleepTimerOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [playlistsOpen, setPlaylistsOpen] = useState(false);
  const [themeSwitcherOpen, setThemeSwitcherOpen] = useState(false);
  const [cloudSyncOpen, setCloudSyncOpen] = useState(false);
  const [tagEditorTrack, setTagEditorTrack] = useState<Track | null>(null);
  const [addTrackToPlaylistTarget, setAddTrackToPlaylistTarget] = useState<Track | null>(null);

  const player = AudioPlayerService.getInstance();

  useEffect(() => {
    // 1. Load saved theme
    StorageService.getThemeId().then((id) => {
      if (THEMES[id]) setTheme(THEMES[id]);
    });

    // 2. Subscribe to player updates
    const unsubscribe = player.subscribe((state) => {
      setPlaybackState(state);
    });

    // 3. Scan storage on launch
    loadInitialTracks();

    return () => {
      unsubscribe();
    };
  }, []);

  const loadInitialTracks = async () => {
    setIsLoading(true);
    const result = await StorageScannerService.scanLocalStorage();
    setTracks(result.tracks);
    setPermissionGranted(result.permissionGranted);
    setIsLoading(false);

    // If player has no queue yet, load all tracks into queue
    if (result.tracks.length > 0 && player.getQueue().length === 0) {
      player.setQueue(result.tracks, 0);
    }
  };

  const handleScanDevice = async () => {
    setIsLoading(true);
    const result = await StorageScannerService.scanLocalStorage();
    setTracks(result.tracks);
    setPermissionGranted(result.permissionGranted);
    setIsLoading(false);

    if (result.tracks.length > 0) {
      player.setQueue(result.tracks, 0);
    }

    if (!result.permissionGranted) {
      Alert.alert(
        'Storage Permission Required',
        'To scan all local MP3/audio files on Android/iOS, please allow storage permissions in device settings, or use the "Pick Audio Files" button.'
      );
    } else {
      Alert.alert('Scan Complete', `Found and loaded ${result.tracks.length} audio tracks.`);
    }
  };

  const handlePickFiles = async () => {
    const picked = await StorageScannerService.pickAudioFiles();
    if (picked.length > 0) {
      const refreshed = await StorageScannerService.scanLocalStorage();
      setTracks(refreshed.tracks);
      Alert.alert('Imported', `Successfully imported ${picked.length} audio tracks.`);
    }
  };

  const handleToggleFavorite = async (trackId: string) => {
    const isFav = await StorageService.toggleFavorite(trackId);
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, isFavorite: isFav } : t))
    );
  };

  const handlePlayTrack = (track: Track, contextList: Track[]) => {
    player.playTrack(track, contextList);
  };

  const handlePlayNext = (track: Track) => {
    player.playNext(track);
    Alert.alert('Queue', `"${track.title}" will play next.`);
  };

  const handleAddToQueue = (track: Track) => {
    player.addToQueue(track);
    Alert.alert('Queue', `"${track.title}" added to queue.`);
  };

  const handleAddToPlaylist = (track: Track) => {
    setAddTrackToPlaylistTarget(track);
    setPlaylistsOpen(true);
  };

  const handleEditTags = (track: Track) => {
    setTagEditorTrack(track);
  };

  const handleTagSaved = (updated: Track) => {
    setTracks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    if (playbackState.currentTrack?.id === updated.id) {
      setPlaybackState((prev) => ({ ...prev, currentTrack: updated }));
    }
  };

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    let list = tracks;

    if (activeTab === 'favorites') {
      list = list.filter((t) => t.isFavorite);
    } else if (activeTab === 'folders' && selectedFolder) {
      list = list.filter((t) => (t.folder || 'Unknown Folder') === selectedFolder);
    } else if (activeTab === 'artists' && selectedArtist) {
      list = list.filter((t) => t.artist === selectedArtist);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q) ||
          (t.folder && t.folder.toLowerCase().includes(q))
      );
    }

    return list;
  }, [tracks, activeTab, selectedFolder, selectedArtist, searchQuery]);

  // Grouped folders
  const folders = useMemo(() => {
    const map: Record<string, { count: number; size: number }> = {};
    tracks.forEach((t) => {
      const f = t.folder || 'Device Storage';
      if (!map[f]) map[f] = { count: 0, size: 0 };
      map[f].count += 1;
      map[f].size += t.size || 0;
    });
    return Object.entries(map).map(([name, data]) => ({ name, ...data }));
  }, [tracks]);

  // Grouped artists
  const artists = useMemo(() => {
    const map: Record<string, number> = {};
    tracks.forEach((t) => {
      const a = t.artist || 'Unknown Artist';
      map[a] = (map[a] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [tracks]);

  // Total library stats
  const totalDurationMinutes = Math.round(
    tracks.reduce((acc, t) => acc + (t.duration || 0), 0) / 60
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.brandEyebrow, { color: theme.accent }]}>
            OFFLINE HI-FI AUDIO
          </Text>
          <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>
            Local Music
          </Text>
        </View>

        <View style={styles.headerButtonsRow}>
          {/* Cloud Sync & Backup button */}
          <TactileButton
            onPress={() => setCloudSyncOpen(true)}
            style={[styles.headerIconBtn, { backgroundColor: theme.surfaceLight }]}
          >
            <Ionicons name="cloud-outline" size={20} color={theme.accent} />
          </TactileButton>

          {/* Pick file button */}
          <TactileButton
            onPress={handlePickFiles}
            style={[styles.headerIconBtn, { backgroundColor: theme.surfaceLight }]}
          >
            <Ionicons name="document-text-outline" size={20} color={theme.textPrimary} />
          </TactileButton>

          {/* Scan storage button */}
          <TactileButton
            onPress={handleScanDevice}
            style={[styles.headerIconBtn, { backgroundColor: theme.surfaceLight }]}
          >
            <Ionicons name="scan-outline" size={20} color={theme.textPrimary} />
          </TactileButton>

          {/* Theme switcher button */}
          <TactileButton
            onPress={() => setThemeSwitcherOpen(true)}
            style={[styles.headerIconBtn, { backgroundColor: theme.surfaceLight }]}
          >
            <Ionicons name="color-palette-outline" size={20} color={theme.textPrimary} />
          </TactileButton>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
          ]}
        >
          <Ionicons name="search" size={18} color={theme.textTertiary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tracks, artists, albums..."
            placeholderTextColor={theme.textTertiary}
            style={[styles.searchInput, { color: theme.textPrimary }]}
          />
          {searchQuery.length > 0 && (
            <TactileButton onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
            </TactileButton>
          )}
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabsRow}>
        <TactileButton
          onPress={() => {
            setActiveTab('tracks');
            setSelectedFolder(null);
            setSelectedArtist(null);
          }}
          style={[
            styles.tabItem,
            activeTab === 'tracks' && { borderBottomColor: theme.accent, borderBottomWidth: 2 },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'tracks' ? theme.accent : theme.textSecondary },
            ]}
          >
            Tracks
          </Text>
        </TactileButton>

        <TactileButton
          onPress={() => {
            setActiveTab('folders');
            setSelectedFolder(null);
          }}
          style={[
            styles.tabItem,
            activeTab === 'folders' && { borderBottomColor: theme.accent, borderBottomWidth: 2 },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'folders' ? theme.accent : theme.textSecondary },
            ]}
          >
            Folders
          </Text>
        </TactileButton>

        <TactileButton
          onPress={() => {
            setActiveTab('artists');
            setSelectedArtist(null);
          }}
          style={[
            styles.tabItem,
            activeTab === 'artists' && { borderBottomColor: theme.accent, borderBottomWidth: 2 },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'artists' ? theme.accent : theme.textSecondary },
            ]}
          >
            Artists
          </Text>
        </TactileButton>

        <TactileButton
          onPress={() => {
            setActiveTab('favorites');
            setSelectedFolder(null);
            setSelectedArtist(null);
          }}
          style={[
            styles.tabItem,
            activeTab === 'favorites' && { borderBottomColor: theme.accent, borderBottomWidth: 2 },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'favorites' ? theme.accent : theme.textSecondary },
            ]}
          >
            Favorites
          </Text>
        </TactileButton>

        <TactileButton
          onPress={() => {
            setAddTrackToPlaylistTarget(null);
            setPlaylistsOpen(true);
          }}
          style={styles.tabItem}
        >
          <Text style={[styles.tabText, { color: theme.textSecondary }]}>
            Playlists ↗
          </Text>
        </TactileButton>
      </View>

      {/* Breadcrumb if inside a selected folder or artist */}
      {(selectedFolder || selectedArtist) && (
        <View style={styles.breadcrumbBar}>
          <TactileButton
            onPress={() => {
              setSelectedFolder(null);
              setSelectedArtist(null);
            }}
            style={styles.breadcrumbBtn}
          >
            <Ionicons name="arrow-back" size={16} color={theme.accent} />
            <Text style={[styles.breadcrumbText, { color: theme.accent }]}>
              Back to {selectedFolder ? 'Folders' : 'Artists'}
            </Text>
          </TactileButton>
          <Text style={[styles.breadcrumbCurrent, { color: theme.textPrimary }]} numberOfLines={1}>
            {selectedFolder || selectedArtist}
          </Text>
        </View>
      )}

      {/* Library Stats Ribbon */}
      <View style={styles.statsBar}>
        <Text style={[styles.statsText, { color: theme.textTertiary }]}>
          {tracks.length} tracks • {totalDurationMinutes} mins total
        </Text>
        <TactileButton
          onPress={() => player.setQueue(filteredTracks, 0)}
          style={styles.shuffleAllBtn}
        >
          <Ionicons name="shuffle" size={14} color={theme.accent} />
          <Text style={[styles.shuffleAllText, { color: theme.accent }]}>Shuffle All</Text>
        </TactileButton>
      </View>

      {/* Content Area */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Scanning local storage...
          </Text>
        </View>
      ) : activeTab === 'folders' && !selectedFolder ? (
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
                <Ionicons name="folder" size={26} color={theme.accent} />
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
      ) : activeTab === 'artists' && !selectedArtist ? (
        /* Artists List */
        <FlatList
          data={artists}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TactileButton
              onPress={() => setSelectedArtist(item.name)}
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
                  {item.count} {item.count === 1 ? 'track' : 'tracks'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            </TactileButton>
          )}
        />
      ) : (
        /* Tracks List */
        <FlatList
          data={filteredTracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item, index }) => (
            <TrackListItem
              track={item}
              index={index}
              isCurrent={playbackState.currentTrack?.id === item.id}
              isPlaying={playbackState.isPlaying}
              theme={theme}
              onPress={() => handlePlayTrack(item, filteredTracks)}
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
                {searchQuery ? 'No matching audio tracks' : 'No local music found'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
                {searchQuery
                  ? 'Try a different query or clear the search'
                  : 'Tap "Pick Audio Files" or grant storage permissions to scan your device.'}
              </Text>
              {!searchQuery && (
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

      {/* Floating Bottom Mini Player */}
      {playbackState.currentTrack && (
        <MiniPlayer
          track={playbackState.currentTrack}
          isPlaying={playbackState.isPlaying}
          position={playbackState.position}
          duration={playbackState.duration}
          theme={theme}
          onPress={() => setNowPlayingOpen(true)}
        />
      )}

      {/* Full-Screen Now Playing Modal */}
      <NowPlayingModal
        visible={nowPlayingOpen}
        onClose={() => setNowPlayingOpen(false)}
        playbackState={playbackState}
        theme={theme}
        onOpenEqualizer={() => setEqualizerOpen(true)}
        onOpenSleepTimer={() => setSleepTimerOpen(true)}
        onOpenQueue={() => setQueueOpen(true)}
        onOpenTagEditor={(track) => setTagEditorTrack(track)}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Equalizer Modal */}
      <EqualizerModal
        visible={equalizerOpen}
        onClose={() => setEqualizerOpen(false)}
        theme={theme}
      />

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        visible={sleepTimerOpen}
        onClose={() => setSleepTimerOpen(false)}
        theme={theme}
      />

      {/* Queue Modal */}
      <QueueModal
        visible={queueOpen}
        onClose={() => setQueueOpen(false)}
        theme={theme}
        currentTrackId={playbackState.currentTrack?.id}
        onQueueUpdated={() => {}}
      />

      {/* Playlists Modal */}
      <PlaylistModal
        visible={playlistsOpen}
        onClose={() => {
          setPlaylistsOpen(false);
          setAddTrackToPlaylistTarget(null);
        }}
        theme={theme}
        allTracks={tracks}
        onPlayTracks={(selected) => player.setQueue(selected, 0)}
        addTrackMode={addTrackToPlaylistTarget}
        onTrackAddedToPlaylist={() => {}}
      />

      {/* ID3 Tag Editor Modal */}
      <TagEditorModal
        visible={tagEditorTrack !== null}
        track={tagEditorTrack}
        theme={theme}
        onClose={() => setTagEditorTrack(null)}
        onSaved={handleTagSaved}
      />

      {/* Theme Switcher Modal */}
      <ThemeSwitcherModal
        visible={themeSwitcherOpen}
        onClose={() => setThemeSwitcherOpen(false)}
        currentTheme={theme}
        onThemeChanged={(newTheme) => setTheme(newTheme)}
      />

      {/* Cloud Sync & Backup Modal */}
      <CloudSyncModal
        visible={cloudSyncOpen}
        onClose={() => setCloudSyncOpen(false)}
        theme={theme}
        onSyncCompleted={async () => {
          // Refresh theme if changed on cloud
          const id = await StorageService.getThemeId();
          if (THEMES[id]) setTheme(THEMES[id]);
          // Refresh tracks to reflect any synced metadata / favorites
          loadInitialTracks();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  brandEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 2,
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
  searchContainer: {
    paddingHorizontal: 20,
    marginVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  tabItem: {
    paddingVertical: 10,
    marginRight: 20,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  breadcrumbBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breadcrumbText: {
    fontSize: 12,
    fontWeight: '700',
  },
  breadcrumbCurrent: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  statsText: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  shuffleAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  shuffleAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },
  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  folderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyPickBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyPickBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
