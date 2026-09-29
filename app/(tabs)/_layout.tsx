import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { MiniPlayer } from '../components/MiniPlayer';
import { FloatingPetOverlay } from '../pet/FloatingPetOverlay';
import { HapticTab } from '../components/HapticTab';

export default function TabLayout() {
  const {
    theme,
    playbackState,
    petSettings,
    setNowPlayingOpen,
  } = useMusicPlayer();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.textTertiary,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopColor: theme.surfaceBorder,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 84 : 64,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Library',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'musical-notes' : 'musical-notes-outline'}
                size={20}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'search' : 'search-outline'}
                size={20}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="artists"
          options={{
            title: 'Artists',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'people' : 'people-outline'}
                size={20}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="albums"
          options={{
            title: 'Albums',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'disc' : 'disc-outline'}
                size={20}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="genres"
          options={{
            title: 'Genres',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'grid' : 'grid-outline'}
                size={20}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="playlists"
          options={{
            title: 'Playlists',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'albums' : 'albums-outline'}
                size={20}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="vibes"
          options={{
            title: 'Vibes',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'sparkles' : 'sparkles-outline'}
                size={20}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'settings' : 'settings-outline'}
                size={20}
                color={color}
              />
            ),
          }}
        />
      </Tabs>

      {/* Floating Bottom Mini Player above the Tabs bar */}
      {playbackState.currentTrack && (
        <View style={[styles.miniPlayerAnchor, { bottom: Platform.OS === 'ios' ? 84 : 64 }]}>
          <MiniPlayer
            track={playbackState.currentTrack}
            isPlaying={playbackState.isPlaying}
            position={playbackState.position}
            duration={playbackState.duration}
            theme={theme}
            onPress={() => setNowPlayingOpen(true)}
          />
        </View>
      )}

      {/* Floating Pet Overlay */}
      {petSettings?.enabled && petSettings?.showFloatingMini && (
        <FloatingPetOverlay
          playbackState={playbackState}
          theme={theme}
          petSettings={petSettings}
          onOpenNowPlaying={() => setNowPlayingOpen(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  miniPlayerAnchor: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
