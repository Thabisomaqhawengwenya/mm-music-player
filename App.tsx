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
import {
  Track,
  Album,
  Artist,
  Genre,
  Playlist,
  PlaybackState,
  AppTheme,
  PetSettings,
  PlayerCustomizationSettings,
} from './src/types';
import { THEMES, DEFAULT_THEME } from './src/constants/theme';
import { StorageScannerService } from './src/services/storageScanner';
import { AudioPlayerService } from './src/services/audioPlayer';
import {
  StorageService,
  defaultPetSettings,
  defaultPlayerCustomizationSettings,
} from './src/services/playlistStorage';
import { TactileButton } from './src/components/TactileButton';
import { TrackListItem } from './src/components/TrackListItem';
import { MiniPlayer } from './src/components/MiniPlayer';
import { NowPlayingModal } from './src/components/NowPlayingModal';
import { EqualizerModal } from './src/components/EqualizerModal';
import { SleepTimerModal } from './src/components/SleepTimerModal';
import { QueueModal } from './src/components/QueueModal';
import { PlaylistModal } from './src/components/PlaylistModal';
import { PlaylistDetailModal } from './src/components/PlaylistDetailModal';
import { AlbumDetailModal } from './src/components/AlbumDetailModal';
import { ArtistDetailModal } from './src/components/ArtistDetailModal';
import { GenreDetailModal } from './src/components/GenreDetailModal';
import { AlbumsView } from './src/components/AlbumsView';
import { GenresView } from './src/components/GenresView';
import { SearchHubView } from './src/components/SearchHubView';
import { SettingsView } from './src/components/SettingsView';
import { TagEditorModal } from './src/components/TagEditorModal';
import { ThemeSwitcherModal } from './src/components/ThemeSwitcherModal';
import { CloudSyncModal } from './src/components/CloudSyncModal';
import { TermsModal } from './src/components/TermsModal';
import { PrivacyModal } from './src/components/PrivacyModal';
import { FloatingPetOverlay } from './src/pet/FloatingPetOverlay';
import { FloatingGlassNavBar } from './src/components/FloatingGlassNavBar';
import { formatFileSize } from './src/utils/formatters';

type MainNavTab = 'library' | 'playlists' | 'search' | 'settings';
type LibrarySubTab = 'tracks' | 'albums' | 'artists' | 'folders' | 'genres' | 'favorites';

export default function App() {
  const [theme, setTheme] = useState<AppTheme>(DEFAULT_THEME);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  // Navigation state
  const [mainTab, setMainTab] = useState<MainNavTab>('library');
  const [librarySubTab, setLibrarySubTab] = useState<LibrarySubTab>('tracks');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Detail modals
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

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

  // Action modals
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);
  const [equalizerOpen, setEqualizerOpen] = useState(false);
  const [sleepTimerOpen, setSleepTimerOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [playlistsOpen, setPlaylistsOpen] = useState(false);
  const [themeSwitcherOpen, setThemeSwitcherOpen] = useState(false);
  const [cloudSyncOpen, setCloudSyncOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [petSettings, setPetSettings] = useState<PetSettings>(defaultPetSettings);
  const [playerCustomization, setPlayerCustomization] = useState<PlayerCustomizationSettings>(
    defaultPlayerCustomizationSettings
  );
  const [tagEditorTrack, setTagEditorTrack] = useState<Track | null>(null);
  const [addTrackToPlaylistTarget, setAddTrackToPlaylistTarget] = useState<Track | null>(null);

  const player = AudioPlayerService.getInstance();

  useEffect(() => {
    // 1. Load saved theme
    StorageService.getThemeId().then((id) => {
      if (THEMES[id]) setTheme(THEMES[id]);
    });

    // 2. Subscribe to audio player state
    const unsubscribe = player.subscribe((state) => {
      setPlaybackState(state);
    });

    // 3. Scan library and load playlists
    loadInitialData();

    return () => {
      unsubscribe();
    };
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    const result = await StorageScannerService.scanLocalStorage();
    setTracks(result.tracks);
    setPermissionGranted(result.permissionGranted);

    const [savedPlaylists, savedPet, savedCustomization] = await Promise.all([
      StorageService.getPlaylists(),
      StorageService.getPetSettings(),
      StorageService.getPlayerCustomizationSettings(),
    ]);

    setPlaylists(savedPlaylists);
    setPetSettings(savedPet);
    setPlayerCustomization(savedCustomization);

    setIsLoading(false);

    if (result.tracks.length > 0 && player.getQueue().length === 0) {
      player.setQueue(result.tracks, 0);
    }
  };

  const handleUpdatePlayerCustomization = async (updated: Partial<PlayerCustomizationSettings>) => {
    setPlayerCustomization((prev) => {
      const merged = { ...prev, ...updated };
      StorageService.savePlayerCustomizationSettings(merged);
      return merged;
    });
  };

  const refreshPlaylists = async () => {
    const list = await StorageService.getPlaylists();
    setPlaylists(list);
    if (selectedPlaylist) {
      const updated = list.find((p) => p.id === selectedPlaylist.id);
      setSelectedPlaylist(updated || null);
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
        'Storage Permission',
        'Please allow audio permissions in device settings, or pick individual files with the Document button.'
      );
    } else {
      Alert.alert('Scan Complete', `Loaded ${result.tracks.length} offline audio tracks.`);
    }
  };

  const handlePickFiles = async () => {
    const picked = await StorageScannerService.pickAudioFiles();
    if (picked.length > 0) {
      const refreshed = await StorageScannerService.scanLocalStorage();
      setTracks(refreshed.tracks);
      Alert.alert('Imported', `Imported ${picked.length} audio tracks.`);
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

  const handlePlayAll = (list: Track[], shuffle: boolean) => {
    if (list.length === 0) return;
    if (shuffle) {
      const shuffled = [...list].sort(() => Math.random() - 0.5);
      player.setQueue(shuffled, 0);
    } else {
      player.setQueue(list, 0);
    }
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

  // Grouped collections
  const albums = useMemo(() => StorageScannerService.groupTracksByAlbum(tracks), [tracks]);
  const artists = useMemo(() => StorageScannerService.groupTracksByArtist(tracks), [tracks]);
  const genres = useMemo(() => StorageScannerService.groupTracksByGenre(tracks), [tracks]);

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

  // Filtered tracks for Library view
  const libraryTracks = useMemo(() => {
    if (librarySubTab === 'favorites') {
      return tracks.filter((t) => t.isFavorite);
    }
    if (librarySubTab === 'folders' && selectedFolder) {
      return tracks.filter((t) => (t.folder || 'Unknown Folder') === selectedFolder);
    }
    return tracks;
  }, [tracks, librarySubTab, selectedFolder]);

  const totalDurationMinutes = Math.round(
    tracks.reduce((acc, t) => acc + (t.duration || 0), 0) / 60
  );

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.background }]}>
      <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" />

      {/* Main Screen Header */}
      {mainTab !== 'settings' && (
        <View style={styles.header}>
          <View>
            <Text style={[styles.brandEyebrow, { color: theme.accent }]}>
              HI-FI OFFLINE AUDIO
            </Text>
            <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>
              {mainTab === 'library'
                ? 'Local Music'
                : mainTab === 'playlists'
                ? 'Playlists'
                : 'Search Library'}
            </Text>
          </View>

          <View style={styles.headerButtonsRow}>
            {/* Cloud Sync shortcut */}
            <TactileButton
              onPress={() => setCloudSyncOpen(true)}
              style={[styles.headerIconBtn, { backgroundColor: theme.surfaceLight }]}
            >
              <Ionicons name="cloud-outline" size={20} color={theme.accent} />
            </TactileButton>

            {/* Quick Rescan */}
            <TactileButton
              onPress={handleScanDevice}
              style={[styles.headerIconBtn, { backgroundColor: theme.surfaceLight }]}
            >
              <Ionicons name="scan-outline" size={20} color={theme.textPrimary} />
            </TactileButton>

            {/* Theme Palette */}
            <TactileButton
              onPress={() => setThemeSwitcherOpen(true)}
              style={[styles.headerIconBtn, { backgroundColor: theme.surfaceLight }]}
            >
              <Ionicons name="color-palette-outline" size={20} color={theme.textPrimary} />
            </TactileButton>
          </View>
        </View>
      )}

      {/* Active Tab Screen Content */}
      <View style={styles.mainContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Scanning storage & audio files...
            </Text>
          </View>
        ) : mainTab === 'library' ? (
          /* LIBRARY TAB */
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
                onSelectAlbum={(alb) => setSelectedAlbum(alb)}
              />
            ) : librarySubTab === 'genres' ? (
              <GenresView
                genres={genres}
                theme={theme}
                onSelectGenre={(gen) => setSelectedGenre(gen)}
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
        ) : mainTab === 'playlists' ? (
          /* PLAYLISTS TAB */
          <View style={{ flex: 1, paddingHorizontal: 20 }}>
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
              contentContainerStyle={{ paddingBottom: 130 }}
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
        ) : mainTab === 'search' ? (
          /* SEARCH HUB TAB */
          <SearchHubView
            tracks={tracks}
            albums={albums}
            artists={artists}
            theme={theme}
            currentTrackId={playbackState.currentTrack?.id}
            isPlaying={playbackState.isPlaying}
            onPlayTrack={handlePlayTrack}
            onSelectAlbum={(alb) => setSelectedAlbum(alb)}
            onSelectArtist={(art) => setSelectedArtist(art)}
            onToggleFavorite={handleToggleFavorite}
            onPlayNext={handlePlayNext}
            onAddToQueue={handleAddToQueue}
            onAddToPlaylist={handleAddToPlaylist}
            onEditTags={handleEditTags}
          />
        ) : (
          /* SETTINGS TAB */
          <SettingsView
            theme={theme}
            playerCustomization={playerCustomization}
            onUpdatePlayerCustomization={handleUpdatePlayerCustomization}
            onThemeChanged={(newTheme) => setTheme(newTheme)}
            onOpenCloudSync={() => setCloudSyncOpen(true)}
            onOpenTerms={() => setTermsOpen(true)}
            onOpenPrivacy={() => setPrivacyOpen(true)}
            onOpenEqualizer={() => setEqualizerOpen(true)}
            onScanDevice={handleScanDevice}
            onPickFiles={handlePickFiles}
            onSettingsChanged={() => loadInitialData()}
          />
        )}
      </View>

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

      {/* Floating Glassmorphic Island Navigation Bar */}
      <FloatingGlassNavBar
        activeTab={mainTab}
        onSelectTab={(tab) => setMainTab(tab)}
        theme={theme}
      />

      {/* MODALS */}

      {/* Full-Screen Now Playing Modal */}
      <NowPlayingModal
        visible={nowPlayingOpen}
        onClose={() => setNowPlayingOpen(false)}
        playbackState={playbackState}
        theme={theme}
        petSettings={petSettings}
        playerCustomization={playerCustomization}
        onUpdatePlayerCustomization={handleUpdatePlayerCustomization}
        onNavigateToTab={(tab) => {
          setNowPlayingOpen(false);
          setMainTab(tab);
        }}
        onOpenEqualizer={() => setEqualizerOpen(true)}
        onOpenSleepTimer={() => setSleepTimerOpen(true)}
        onOpenQueue={() => setQueueOpen(true)}
        onOpenTagEditor={(track) => setTagEditorTrack(track)}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Album Detail Modal */}
      <AlbumDetailModal
        visible={selectedAlbum !== null}
        album={selectedAlbum}
        theme={theme}
        currentTrackId={playbackState.currentTrack?.id}
        isPlaying={playbackState.isPlaying}
        onClose={() => setSelectedAlbum(null)}
        onPlayTrack={handlePlayTrack}
        onPlayAll={handlePlayAll}
        onToggleFavorite={handleToggleFavorite}
        onPlayNext={handlePlayNext}
        onAddToQueue={handleAddToQueue}
        onAddToPlaylist={handleAddToPlaylist}
        onEditTags={handleEditTags}
      />

      {/* Artist Detail Modal */}
      <ArtistDetailModal
        visible={selectedArtist !== null}
        artist={selectedArtist}
        artistAlbums={albums.filter((a) => a.artist === selectedArtist?.name)}
        theme={theme}
        currentTrackId={playbackState.currentTrack?.id}
        isPlaying={playbackState.isPlaying}
        onClose={() => setSelectedArtist(null)}
        onSelectAlbum={(alb) => {
          setSelectedAlbum(alb);
        }}
        onPlayTrack={handlePlayTrack}
        onPlayAll={handlePlayAll}
        onToggleFavorite={handleToggleFavorite}
        onPlayNext={handlePlayNext}
        onAddToQueue={handleAddToQueue}
        onAddToPlaylist={handleAddToPlaylist}
        onEditTags={handleEditTags}
      />

      {/* Genre Detail Modal */}
      <GenreDetailModal
        visible={selectedGenre !== null}
        genre={selectedGenre}
        theme={theme}
        currentTrackId={playbackState.currentTrack?.id}
        isPlaying={playbackState.isPlaying}
        onClose={() => setSelectedGenre(null)}
        onPlayTrack={handlePlayTrack}
        onPlayAll={handlePlayAll}
        onToggleFavorite={handleToggleFavorite}
        onPlayNext={handlePlayNext}
        onAddToQueue={handleAddToQueue}
        onAddToPlaylist={handleAddToPlaylist}
        onEditTags={handleEditTags}
      />

      {/* Playlist Detail Modal */}
      <PlaylistDetailModal
        visible={selectedPlaylist !== null}
        playlist={selectedPlaylist}
        allTracks={tracks}
        theme={theme}
        currentTrackId={playbackState.currentTrack?.id}
        isPlaying={playbackState.isPlaying}
        onClose={() => setSelectedPlaylist(null)}
        onPlaylistUpdated={refreshPlaylists}
        onPlayTrack={handlePlayTrack}
        onPlayAll={handlePlayAll}
        onToggleFavorite={handleToggleFavorite}
        onPlayNext={handlePlayNext}
        onAddToQueue={handleAddToQueue}
        onAddToPlaylist={handleAddToPlaylist}
        onEditTags={handleEditTags}
      />

      {/* Playlists Management / Add Track Modal */}
      <PlaylistModal
        visible={playlistsOpen}
        onClose={() => {
          setPlaylistsOpen(false);
          setAddTrackToPlaylistTarget(null);
        }}
        theme={theme}
        allTracks={tracks}
        onPlayTracks={(selected) => player.setQueue(selected, 0)}
        onOpenPlaylistDetail={(pl) => setSelectedPlaylist(pl)}
        addTrackMode={addTrackToPlaylistTarget}
        onTrackAddedToPlaylist={refreshPlaylists}
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
          const id = await StorageService.getThemeId();
          if (THEMES[id]) setTheme(THEMES[id]);
          loadInitialData();
        }}
      />

      {/* Terms & Conditions Modal */}
      <TermsModal
        visible={termsOpen}
        onClose={() => setTermsOpen(false)}
        theme={theme}
      />

      {/* Privacy Policy Modal */}
      <PrivacyModal
        visible={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        theme={theme}
      />

      {/* Floating Music Pet Companion */}
      <FloatingPetOverlay
        playbackState={playbackState}
        theme={theme}
        petSettings={petSettings}
        onOpenNowPlaying={() => setNowPlayingOpen(true)}
      />
    </SafeAreaView>
  </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  root: {
    flex: 1,
    width: '100%',
    maxWidth: 580,
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
  mainContainer: {
    flex: 1,
  },
  subTabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  subTabsRow: {
    paddingHorizontal: 20,
    gap: 20,
  },
  subTabItem: {
    paddingVertical: 10,
  },
  subTabText: {
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
    paddingBottom: 130,
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
  playlistActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
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
    fontSize: 12,
    fontWeight: '800',
  },
  bottomNavBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 64,
  },
  navTabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
    gap: 4,
  },
  navIconBox: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTabLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
