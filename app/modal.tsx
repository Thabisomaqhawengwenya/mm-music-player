import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useMusicPlayer } from './context/MusicPlayerContext';
import { TactileButton } from './components/TactileButton';
import { useRouter } from 'expo-router';

export default function ModalScreen() {
  const router = useRouter();
  const { theme, playbackState } = useMusicPlayer();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>Quick Info</Text>
      <View style={[styles.separator, { backgroundColor: theme.surfaceBorder }]} />

      <Text style={[styles.subText, { color: theme.textSecondary }]}>
        {playbackState.currentTrack
          ? `Playing: ${playbackState.currentTrack.title} by ${playbackState.currentTrack.artist}`
          : 'No track currently playing.'}
      </Text>

      <TactileButton
        onPress={() => router.back()}
        style={[styles.dismissBtn, { backgroundColor: theme.accent }]}
      >
        <Text style={[styles.dismissText, { color: theme.background }]}>Close</Text>
      </TactileButton>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
  },
  subText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  dismissBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
