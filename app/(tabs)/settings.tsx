import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { SettingsView } from '../components/SettingsView';

export default function SettingsTab() {
  const {
    theme,
    setTheme,
    playerCustomization,
    handleUpdatePlayerCustomization,
    setTermsOpen,
    setPrivacyOpen,
    setEqualizerOpen,
    handleScanDevice,
    handlePickFiles,
    loadInitialData,
  } = useMusicPlayer();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <SettingsView
        theme={theme}
        playerCustomization={playerCustomization}
        onUpdatePlayerCustomization={handleUpdatePlayerCustomization}
        onThemeChanged={(newTheme: any) => setTheme(newTheme)}
        onOpenTerms={() => setTermsOpen(true)}
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onOpenEqualizer={() => setEqualizerOpen(true)}
        onScanDevice={handleScanDevice}
        onPickFiles={handlePickFiles}
        onSettingsChanged={() => loadInitialData()}
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
