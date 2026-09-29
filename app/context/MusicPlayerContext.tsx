import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { Alert } from 'react-native';
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
} from '../../src/types';
import { THEMES, DEFAULT_THEME } from '../constants/theme';
import { AudioPlayerService } from '../../src/services/audioPlayer';
import { StorageScannerService } from '../../src/services/storageScanner';
import { extractDynamicThemeFromTrack } from '../../src/utils/dynamicTheme';
import {
  StorageService,
  defaultPetSettings,
  defaultPlayerCustomizationSettings,
} from '../../src/services/playlistStorage';

export type MainNavTab = 'library' | 'playlists' | 'vibes' | 'settings';
export type LibrarySubTab = 'tracks' | 'albums' | 'artists' | 'folders' | 'genres' | 'favorites';

export interface MusicPlayerContextType {
  // Theme & State
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  tracks: Track[];
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
  playlists: Playlist[];
  setPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>;
  isLoading: boolean;
  permissionGranted: boolean;
  playbackState: PlaybackState;
  petSettings: PetSettings;
  setPetSettings: React.Dispatch<React.SetStateAction<PetSettings>>;
  playerCustomization: PlayerCustomizationSettings;
  setPlayerCustomization: React.Dispatch<React.SetStateAction<PlayerCustomizationSettings>>;

  // SubTab Navigation State
  librarySubTab: LibrarySubTab;
  setLibrarySubTab: (subTab: LibrarySubTab) => void;
  selectedFolder: string | null;
  setSelectedFolder: (folder: string | null) => void;

  // Selected details
  selectedAlbum: Album | null;
  setSelectedAlbum: (album: Album | null) => void;
  selectedArtist: Artist | null;
  setSelectedArtist: (artist: Artist | null) => void;
  selectedGenre: Genre | null;
  setSelectedGenre: (genre: Genre | null) => void;
  selectedPlaylist: Playlist | null;
  setSelectedPlaylist: (playlist: Playlist | null) => void;

  // Modals state
  nowPlayingOpen: boolean;
  setNowPlayingOpen: (open: boolean) => void;
  equalizerOpen: boolean;
  setEqualizerOpen: (open: boolean) => void;
  sleepTimerOpen: boolean;
  setSleepTimerOpen: (open: boolean) => void;
  queueOpen: boolean;
  setQueueOpen: (open: boolean) => void;
  playlistsOpen: boolean;
  setPlaylistsOpen: (open: boolean) => void;
  themeSwitcherOpen: boolean;
  setThemeSwitcherOpen: (open: boolean) => void;
  termsOpen: boolean;
  setTermsOpen: (open: boolean) => void;
  privacyOpen: boolean;
  setPrivacyOpen: (open: boolean) => void;
  tagEditorTrack: Track | null;
  setTagEditorTrack: (track: Track | null) => void;
  addTrackToPlaylistTarget: Track | null;
  setAddTrackToPlaylistTarget: (track: Track | null) => void;

  // Grouped collections
  albums: Album[];
  artists: Artist[];
  genres: Genre[];
  folders: { name: string; count: number; size: number }[];
  libraryTracks: Track[];
  totalDurationMinutes: number;

  // Actions
  loadInitialData: () => Promise<void>;
  handleScanDevice: () => Promise<void>;
  handlePickFiles: () => Promise<void>;
  handleToggleFavorite: (trackId: string) => Promise<void>;
  handlePlayTrack: (track: Track, contextList?: Track[]) => void;
  handlePlayAll: (list: Track[], shuffle: boolean) => void;
  handlePlayNext: (track: Track) => void;
  handleAddToQueue: (track: Track) => void;
  handleAddToPlaylist: (track: Track) => void;
  handleEditTags: (track: Track) => void;
  handleTagSaved: (updated: Track) => void;
  handleUpdatePlayerCustomization: (updated: Partial<PlayerCustomizationSettings>) => Promise<void>;
  refreshPlaylists: () => Promise<void>;
  player: AudioPlayerService;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

export const MusicPlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [baseTheme, setBaseTheme] = useState<AppTheme>(DEFAULT_THEME);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  // Sub-tab navigation
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
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [petSettings, setPetSettings] = useState<PetSettings>(defaultPetSettings);
  const [playerCustomization, setPlayerCustomization] = useState<PlayerCustomizationSettings>(
    defaultPlayerCustomizationSettings
  );
  const [tagEditorTrack, setTagEditorTrack] = useState<Track | null>(null);
  const [addTrackToPlaylistTarget, setAddTrackToPlaylistTarget] = useState<Track | null>(null);

  const player = AudioPlayerService.getInstance();

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

  useEffect(() => {
    // 1. Load saved theme
    StorageService.getThemeId().then((id) => {
      if (THEMES[id]) setBaseTheme(THEMES[id]);
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
    player.updateTrackFavorite(trackId, isFav);
    setPlaybackState((prev) => {
      if (prev.currentTrack?.id === trackId) {
        return {
          ...prev,
          currentTrack: { ...prev.currentTrack, isFavorite: isFav },
        };
      }
      return prev;
    });
  };

  const handlePlayTrack = (track: Track, contextList?: Track[]) => {
    StorageService.recordTrackPlay(track);
    player.playTrack(track, contextList);
  };

  const handlePlayAll = (list: Track[], shuffle: boolean) => {
    if (list.length === 0) return;
    if (shuffle) {
      const shuffled = [...list].sort(() => Math.random() - 0.5);
      StorageService.recordTrackPlay(shuffled[0]);
      player.playTrack(shuffled[0], shuffled);
    } else {
      StorageService.recordTrackPlay(list[0]);
      player.playTrack(list[0], list);
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

  // Dynamic Material You Theme calculation
  const theme = useMemo(() => {
    let active = baseTheme;
    if (playerCustomization?.materialYouDynamic && playbackState.currentTrack) {
      active = extractDynamicThemeFromTrack(playbackState.currentTrack, baseTheme);
    }
    if (playerCustomization?.cornerRadius) {
      const cr = playerCustomization.cornerRadius;
      return {
        ...active,
        borderRadius: {
          sm: Math.max(6, cr - 8),
          md: cr,
          lg: cr + 4,
          card: cr,
          pill: 9999,
        },
      };
    }
    return active;
  }, [baseTheme, playerCustomization?.materialYouDynamic, playerCustomization?.cornerRadius, playbackState.currentTrack]);

  const handleSetTheme = (newTheme: AppTheme) => {
    setBaseTheme(newTheme);
    StorageService.saveThemeId(newTheme.id);
  };

  // Grouped collections
  const albums = useMemo(() => StorageScannerService.groupTracksByAlbum(tracks), [tracks]);
  const artists = useMemo(
    () => StorageScannerService.groupTracksByArtist(tracks, playerCustomization?.artistDelimiters),
    [tracks, playerCustomization?.artistDelimiters]
  );
  const genres = useMemo(() => StorageScannerService.groupTracksByGenre(tracks), [tracks]);

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
    <MusicPlayerContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        tracks,
        setTracks,
        playlists,
        setPlaylists,
        isLoading,
        permissionGranted,
        playbackState,
        petSettings,
        setPetSettings,
        playerCustomization,
        setPlayerCustomization,
        librarySubTab,
        setLibrarySubTab,
        selectedFolder,
        setSelectedFolder,
        selectedAlbum,
        setSelectedAlbum,
        selectedArtist,
        setSelectedArtist,
        selectedGenre,
        setSelectedGenre,
        selectedPlaylist,
        setSelectedPlaylist,
        nowPlayingOpen,
        setNowPlayingOpen,
        equalizerOpen,
        setEqualizerOpen,
        sleepTimerOpen,
        setSleepTimerOpen,
        queueOpen,
        setQueueOpen,
        playlistsOpen,
        setPlaylistsOpen,
        themeSwitcherOpen,
        setThemeSwitcherOpen,
        termsOpen,
        setTermsOpen,
        privacyOpen,
        setPrivacyOpen,
        tagEditorTrack,
        setTagEditorTrack,
        addTrackToPlaylistTarget,
        setAddTrackToPlaylistTarget,
        albums,
        artists,
        genres,
        folders,
        libraryTracks,
        totalDurationMinutes,
        loadInitialData,
        handleScanDevice,
        handlePickFiles,
        handleToggleFavorite,
        handlePlayTrack,
        handlePlayAll,
        handlePlayNext,
        handleAddToQueue,
        handleAddToPlaylist,
        handleEditTags,
        handleTagSaved,
        handleUpdatePlayerCustomization,
        refreshPlaylists,
        player,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
