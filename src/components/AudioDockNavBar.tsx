import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppTheme } from '../types';

export type MainNavTab = 'library' | 'playlists' | 'vibes' | 'settings';
export type LibrarySubTab = 'tracks' | 'albums' | 'artists' | 'folders' | 'genres' | 'favorites';

interface AudioDockNavBarProps {
  activeTab: MainNavTab;
  librarySubTab: LibrarySubTab;
  isPlaying: boolean;
  onSelectTab: (tab: MainNavTab, subTab?: LibrarySubTab) => void;
  onTogglePlayPause: () => void;
  onOpenQueue: () => void;
  onOpenTagEditor: () => void;
  onOpenNowPlaying: () => void;
  onOpenMoreMenu: () => void;
  theme: AppTheme;
}

const INDICATOR_WIDTH = 34;

export const AudioDockNavBar: React.FC<AudioDockNavBarProps> = ({
  activeTab,
  librarySubTab,
  isPlaying,
  onSelectTab,
  onTogglePlayPause,
  onOpenQueue,
  onOpenTagEditor,
  onOpenNowPlaying,
  onOpenMoreMenu,
  theme,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);

  // Compute which of the 9 dock items is active:
  // 0: Queue, 1: Play, 2: Folders, 3: Disc/Albums, 4: Person/Artists, 5: Tag, 6: Library, 7: Vibes, 8: More
  const getActiveIndex = (): number => {
    if (activeTab === 'playlists') return 0;
    if (activeTab === 'vibes') return 7;
    if (activeTab === 'settings') return 8;
    if (activeTab === 'library') {
      if (librarySubTab === 'folders') return 2;
      if (librarySubTab === 'albums') return 3;
      if (librarySubTab === 'artists') return 4;
      return 6; // tracks, favorites, genres
    }
    return 1;
  };

  const activeIndex = getActiveIndex();
  const slideAnim = useRef(new Animated.Value(activeIndex)).current;
  const playScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIndex,
      tension: 72,
      friction: 11,
      useNativeDriver: false,
    }).start();
  }, [activeIndex]);

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const colWidth = containerWidth > 0 ? containerWidth / 9 : 0;
  const indicatorLeft = slideAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    outputRange: [
      (colWidth - INDICATOR_WIDTH) / 2,
      colWidth * 1 + (colWidth - INDICATOR_WIDTH) / 2,
      colWidth * 2 + (colWidth - INDICATOR_WIDTH) / 2,
      colWidth * 3 + (colWidth - INDICATOR_WIDTH) / 2,
      colWidth * 4 + (colWidth - INDICATOR_WIDTH) / 2,
      colWidth * 5 + (colWidth - INDICATOR_WIDTH) / 2,
      colWidth * 6 + (colWidth - INDICATOR_WIDTH) / 2,
      colWidth * 7 + (colWidth - INDICATOR_WIDTH) / 2,
      colWidth * 8 + (colWidth - INDICATOR_WIDTH) / 2,
    ],
  });

  const handlePlayPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Animated.sequence([
      Animated.timing(playScaleAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.timing(playScaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onTogglePlayPause();
  };

  const triggerHaptic = () => {
    Haptics.selectionAsync().catch(() => {});
  };

  const inactiveColor = '#808080';
  const activeColor = '#ffffff';

  return (
    <View style={styles.dockRoot} onLayout={onLayout}>
      {/* Top Border Line & Active Indicator Segment */}
      <View style={styles.topBorderLine} />
      {colWidth > 0 && (
        <Animated.View
          style={[
            styles.activeIndicatorSegment,
            {
              left: indicatorLeft,
              width: INDICATOR_WIDTH,
            },
          ]}
        />
      )}

      {/* 9 Dock Action Buttons */}
      <View style={styles.actionsRow}>
        {/* 1. Queue / Playlists */}
        <TouchableOpacity
          style={styles.dockItemBtn}
          onPress={() => {
            triggerHaptic();
            onOpenQueue();
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="list"
            size={22}
            color={activeIndex === 0 ? activeColor : inactiveColor}
          />
        </TouchableOpacity>

        {/* 2. Play / Pause Circular Button */}
        <TouchableOpacity
          style={styles.dockItemBtn}
          onPress={handlePlayPress}
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
            onOpenNowPlaying();
          }}
          activeOpacity={0.85}
        >
          <Animated.View
            style={[
              styles.whitePlayCircle,
              { transform: [{ scale: playScaleAnim }] },
            ]}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={15}
              color="#000000"
              style={{ marginLeft: isPlaying ? 0 : 2 }}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* 3. Folder */}
        <TouchableOpacity
          style={styles.dockItemBtn}
          onPress={() => {
            triggerHaptic();
            onSelectTab('library', 'folders');
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="folder"
            size={21}
            color={activeIndex === 2 ? activeColor : inactiveColor}
          />
        </TouchableOpacity>

        {/* 4. Disc / Albums */}
        <TouchableOpacity
          style={styles.dockItemBtn}
          onPress={() => {
            triggerHaptic();
            onSelectTab('library', 'albums');
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="disc"
            size={21}
            color={activeIndex === 3 ? activeColor : inactiveColor}
          />
        </TouchableOpacity>

        {/* 5. Person / Artists */}
        <TouchableOpacity
          style={styles.dockItemBtn}
          onPress={() => {
            triggerHaptic();
            onSelectTab('library', 'artists');
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="person"
            size={20}
            color={activeIndex === 4 ? activeColor : inactiveColor}
          />
        </TouchableOpacity>

        {/* 6. Tag / Tag Editor */}
        <TouchableOpacity
          style={styles.dockItemBtn}
          onPress={() => {
            triggerHaptic();
            onOpenTagEditor();
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="pricetag"
            size={19}
            color={activeIndex === 5 ? activeColor : inactiveColor}
          />
        </TouchableOpacity>

        {/* 7. Albums / Library Tracks */}
        <TouchableOpacity
          style={styles.dockItemBtn}
          onPress={() => {
            triggerHaptic();
            onSelectTab('library', 'tracks');
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="albums"
            size={21}
            color={activeIndex === 6 ? activeColor : inactiveColor}
          />
        </TouchableOpacity>

        {/* 8. Search / Vibes Station */}
        <TouchableOpacity
          style={styles.dockItemBtn}
          onPress={() => {
            triggerHaptic();
            onSelectTab('vibes');
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="search"
            size={20}
            color={activeIndex === 7 ? activeColor : inactiveColor}
          />
        </TouchableOpacity>

        {/* 9. More Options */}
        <TouchableOpacity
          style={styles.dockItemBtn}
          onPress={() => {
            triggerHaptic();
            onOpenMoreMenu();
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={activeIndex === 8 ? activeColor : inactiveColor}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockRoot: {
    width: '100%',
    backgroundColor: '#000000',
    position: 'relative',
    paddingBottom: Platform.OS === 'ios' ? 22 : 6,
    paddingTop: 0,
  },
  topBorderLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  activeIndicatorSegment: {
    position: 'absolute',
    top: 0,
    height: 2.5,
    backgroundColor: '#ffffff',
    borderRadius: 1.25,
    zIndex: 10,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 54,
    paddingHorizontal: 4,
  },
  dockItemBtn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  whitePlayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
});
