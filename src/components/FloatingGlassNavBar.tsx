import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppTheme } from '../types';

export type MainNavTab = 'library' | 'playlists' | 'search' | 'settings';

interface TabItemConfig {
  key: MainNavTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItemConfig[] = [
  { key: 'library', label: 'Library', icon: 'library-outline', activeIcon: 'library' },
  { key: 'playlists', label: 'Playlists', icon: 'musical-notes-outline', activeIcon: 'musical-notes' },
  { key: 'search', label: 'Search', icon: 'search-outline', activeIcon: 'search' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline', activeIcon: 'settings' },
];

interface FloatingGlassNavBarProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  theme: AppTheme;
}

export const FloatingGlassNavBar: React.FC<FloatingGlassNavBarProps> = ({
  activeTab,
  onSelectTab,
  theme,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndex = TABS.findIndex((t) => t.key === activeTab);
  const slideAnim = useRef(new Animated.Value(Math.max(0, activeIndex))).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const targetIdx = Math.max(0, TABS.findIndex((t) => t.key === activeTab));
    Animated.spring(slideAnim, {
      toValue: targetIdx,
      tension: 68,
      friction: 10,
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  const handlePress = (tabKey: MainNavTab, idx: number) => {
    if (tabKey !== activeTab) {
      Haptics.selectionAsync().catch(() => {});
      // Micro-bounce effect on press
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
      onSelectTab(tabKey);
    }
  };

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const tabWidth = containerWidth > 0 ? (containerWidth - 12) / TABS.length : 0;

  const indicatorLeft = slideAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [6, 6 + tabWidth, 6 + tabWidth * 2, 6 + tabWidth * 3],
  });

  const activeCyan = '#00e5ff';
  const inactiveColor = theme.id === 'light' ? '#64748b' : '#8897ab';

  return (
    <View style={styles.outerWrapper}>
      <Animated.View
        style={[
          styles.islandContainer,
          {
            backgroundColor:
              theme.id === 'light' ? 'rgba(255, 255, 255, 0.92)' : 'rgba(10, 14, 22, 0.86)',
            borderColor:
              theme.id === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
            shadowColor: theme.id === 'light' ? '#000' : activeCyan,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        onLayout={onLayout}
      >
        {/* Animated Sliding Highlight Pill */}
        {tabWidth > 0 && (
          <Animated.View
            style={[
              styles.indicatorPill,
              {
                width: tabWidth,
                left: indicatorLeft,
                backgroundColor:
                  theme.id === 'light' ? 'rgba(0, 229, 255, 0.14)' : 'rgba(0, 229, 255, 0.12)',
                borderColor: 'rgba(0, 229, 255, 0.32)',
              },
            ]}
          />
        )}

        {/* Tab Items */}
        {TABS.map((tab, idx) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handlePress(tab.key, idx)}
              activeOpacity={0.75}
              style={styles.tabBtn}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={21}
                  color={isActive ? activeCyan : inactiveColor}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? activeCyan : inactiveColor,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
                {/* Luminous Active Indicator Micro-dot */}
                <View
                  style={[
                    styles.activeDot,
                    {
                      backgroundColor: isActive ? activeCyan : 'transparent',
                      shadowOpacity: isActive ? 0.9 : 0,
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 22 : 12,
    paddingTop: 4,
    backgroundColor: 'transparent',
  },
  islandContainer: {
    width: '100%',
    maxWidth: 500,
    height: 62,
    borderRadius: 31,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 1.2,
    position: 'relative',
    overflow: 'hidden',
    // Frosted glassmorphism shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 12,
    // Web backdrop filter
    ...Platform.select({
      web: {
        backdropFilter: 'blur(24px) saturate(190%)',
        WebkitBackdropFilter: 'blur(24px) saturate(190%)',
      } as any,
    }),
  },
  indicatorPill: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    borderRadius: 25,
    borderWidth: 1,
    zIndex: 1,
  },
  tabBtn: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 10.5,
    letterSpacing: 0.2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
  },
});
