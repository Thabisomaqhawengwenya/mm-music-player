import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import { MusicPlayerProvider, useMusicPlayer } from './context/MusicPlayerContext';
import { NowPlayingModal } from './components/NowPlayingModal';
import { AlbumDetailModal } from './components/AlbumDetailModal';
import { ArtistDetailModal } from './components/ArtistDetailModal';
import { GenreDetailModal } from './components/GenreDetailModal';
import { PlaylistDetailModal } from './components/PlaylistDetailModal';
import { PlaylistModal } from './components/PlaylistModal';
import { TagEditorModal } from './components/TagEditorModal';
import { EqualizerModal } from './components/EqualizerModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import { QueueModal } from './components/QueueModal';
import { ThemeSwitcherModal } from './components/ThemeSwitcherModal';
import { TermsModal } from './components/TermsModal';
import { PrivacyModal } from './components/PrivacyModal';
import { AppTheme } from '../src/types';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

function RootLayoutNav() {
  const router = useRouter();
  const {
    theme,
    setTheme,
    tracks,
    albums,
    playbackState,
    petSettings,
    playerCustomization,
    handleUpdatePlayerCustomization,
    handlePlayTrack,
    handlePlayAll,
    handlePlayNext,
    handleAddToQueue,
    handleAddToPlaylist,
    handleEditTags,
    handleTagSaved,
    handleToggleFavorite,
    refreshPlaylists,
    setLibrarySubTab,

    // Modal state
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

    // Selected items
    selectedAlbum,
    setSelectedAlbum,
    selectedArtist,
    setSelectedArtist,
    selectedGenre,
    setSelectedGenre,
    selectedPlaylist,
    setSelectedPlaylist,
  } = useMusicPlayer();

  return (
    <ThemeProvider value={DarkTheme}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style="light" />

        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
        </Stack>

        {/* Global Modals */}

        {/* Full-Screen Now Playing Modal */}
        <NowPlayingModal
          visible={nowPlayingOpen}
          onClose={() => setNowPlayingOpen(false)}
          playbackState={playbackState}
          theme={theme}
          petSettings={petSettings}
          playerCustomization={playerCustomization}
          onUpdatePlayerCustomization={handleUpdatePlayerCustomization}
          onNavigateToTab={(tab, subTab) => {
            setNowPlayingOpen(false);
            if (subTab) {
              setLibrarySubTab(subTab as any);
            }
            if (tab === 'library') router.push('/(tabs)/' as any);
            else if (tab === 'playlists') router.push('/(tabs)/playlists' as any);
            else if (tab === 'vibes') router.push('/(tabs)/vibes' as any);
            else if (tab === 'settings') router.push('/(tabs)/settings' as any);
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

        {/* Add To Playlist Modal */}
        <PlaylistModal
          visible={playlistsOpen}
          onClose={() => {
            setPlaylistsOpen(false);
            setAddTrackToPlaylistTarget(null);
          }}
          theme={theme}
          allTracks={tracks}
          onPlayTracks={(trackList) => handlePlayAll(trackList, false)}
          onOpenPlaylistDetail={(pl) => {
            setPlaylistsOpen(false);
            setSelectedPlaylist(pl);
          }}
          addTrackMode={addTrackToPlaylistTarget}
          onTrackAddedToPlaylist={refreshPlaylists}
        />

        {/* Tag Editor Modal */}
        <TagEditorModal
          visible={tagEditorTrack !== null}
          track={tagEditorTrack}
          theme={theme}
          onClose={() => setTagEditorTrack(null)}
          onSaved={handleTagSaved}
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
          onQueueUpdated={() => { }}
        />

        {/* Theme Switcher Modal */}
        <ThemeSwitcherModal
          visible={themeSwitcherOpen}
          currentTheme={theme}
          onClose={() => setThemeSwitcherOpen(false)}
          onThemeChanged={(newTheme: AppTheme) => setTheme(newTheme)}
        />

        {/* Terms of Service Modal */}
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
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <MusicPlayerProvider>
      <RootLayoutNav />
    </MusicPlayerProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
