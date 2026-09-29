import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useMusicPlayer } from './context/MusicPlayerContext';
import { ListeningStatsView } from './components/ListeningStatsView';

export default function StatsScreen() {
  const router = useRouter();
  const {
    theme,
    tracks,
    handlePlayTrack,
    handleToggleFavorite,
  } = useMusicPlayer();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ListeningStatsView
        theme={theme}
        allTracks={tracks}
        onPlayTrack={handlePlayTrack}
        onToggleFavorite={handleToggleFavorite}
        onBack={() => router.back()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
