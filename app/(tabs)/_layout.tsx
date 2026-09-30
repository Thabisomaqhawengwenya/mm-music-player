import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { MiniPlayer } from '../components/MiniPlayer';
import { FloatingPetOverlay } from '../pet/FloatingPetOverlay';
import { HapticTab } from '../components/HapticTab';

function TabPillIcon({
  name,
  outlineName,
  focused,
  color,
  accentColor,
}: {
  name: keyof typeof Ionicons.glyphMap;
  outlineName: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: any;
  accentColor: string;
}) {
  return (
    <View
      style={{
        width: 52,
        height: 28,
        borderRadius: 14,
        backgroundColor: focused ? `${accentColor}26` : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
      }}
    >
      <Ionicons
        name={focused ? name : outlineName}
        size={20}
        color={focused ? accentColor : color}
      />
    </View>
  );
}

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
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopColor: theme.surfaceBorder,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 86 : 68,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 8,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 0.1,
          },
          headerShown: false,
        }}
      >
        {/* 1. Library / Home */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Library',
            tabBarIcon: ({ color, focused }) => (
              <TabPillIcon
                name="musical-notes"
                outlineName="musical-notes-outline"
                focused={focused}
                color={color}
                accentColor={theme.accent}
              />
            ),
          }}
        />

        {/* 2. Playlists & Daily Mixes */}
        <Tabs.Screen
          name="playlists"
          options={{
            title: 'Mixes',
            tabBarIcon: ({ color, focused }) => (
              <TabPillIcon
                name="albums"
                outlineName="albums-outline"
                focused={focused}
                color={color}
                accentColor={theme.accent}
              />
            ),
          }}
        />

        {/* 3. Vibes Hub & Deck */}
        <Tabs.Screen
          name="vibes"
          options={{
            title: 'Vibes',
            tabBarIcon: ({ color, focused }) => (
              <TabPillIcon
                name="sparkles"
                outlineName="sparkles-outline"
                focused={focused}
                color={color}
                accentColor={theme.accent}
              />
            ),
          }}
        />

        {/* 4. Instant Search */}
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, focused }) => (
              <TabPillIcon
                name="search"
                outlineName="search-outline"
                focused={focused}
                color={color}
                accentColor={theme.accent}
              />
            ),
          }}
        />

        {/* 5. Settings */}
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <TabPillIcon
                name="settings"
                outlineName="settings-outline"
                focused={focused}
                color={color}
                accentColor={theme.accent}
              />
            ),
          }}
        />

        {/* Auxiliary screens - accessible by route, hidden from tab bar */}
        <Tabs.Screen
          name="artists"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="albums"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="genres"
          options={{
            href: null,
            headerShown: false,
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
