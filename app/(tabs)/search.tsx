import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { SearchHubView } from '../components/SearchHubView';

export default function SearchTab() {
  const {
    tracks,
    albums,
    artists,
    theme,
    playbackState,
    handlePlayTrack,
    setSelectedAlbum,
    setSelectedArtist,
    handleToggleFavorite,
    handlePlayNext,
    handleAddToQueue,
    handleAddToPlaylist,
    handleEditTags,
  } = useMusicPlayer();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <SearchHubView
        tracks={tracks}
        albums={albums}
        artists={artists}
        theme={theme}
        currentTrackId={playbackState.currentTrack?.id}
        isPlaying={playbackState.isPlaying}
        onPlayTrack={handlePlayTrack}
        onSelectAlbum={setSelectedAlbum}
        onSelectArtist={setSelectedArtist}
        onToggleFavorite={handleToggleFavorite}
        onPlayNext={handlePlayNext}
        onAddToQueue={handleAddToQueue}
        onAddToPlaylist={handleAddToPlaylist}
        onEditTags={handleEditTags}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 70,
  },
});
