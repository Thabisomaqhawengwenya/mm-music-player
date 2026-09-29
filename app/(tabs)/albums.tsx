import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { AlbumsView } from '../components/AlbumsView';
import { TactileButton } from '../components/TactileButton';

export default function AlbumsTab() {
  const {
    theme,
    albums,
    setSelectedAlbum,
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
            Albums
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
        <AlbumsView
          albums={albums}
          theme={theme}
          onSelectAlbum={setSelectedAlbum}
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
    paddingBottom: 70,
  },
});
